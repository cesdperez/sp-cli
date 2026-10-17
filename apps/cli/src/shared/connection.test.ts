import { describe, expect, it } from 'bun:test';
import { ConfigProvider, Effect } from 'effect';
import { localTokenFile } from './connection';

const resolve = (platform: NodeJS.Platform, env: string) =>
  Effect.runPromise(
    localTokenFile(platform).pipe(
      Effect.provideService(
        ConfigProvider.ConfigProvider,
        ConfigProvider.fromDotEnvContents(env),
      ),
    ),
  );

describe('localTokenFile', () => {
  it('uses ~/.config on Linux', async () => {
    expect(await resolve('linux', 'HOME=/home/me')).toBe(
      '/home/me/.config/superProductivity/local-rest-api-token',
    );
  });

  it('honours XDG_CONFIG_HOME on Linux', async () => {
    expect(await resolve('linux', 'HOME=/home/me\nXDG_CONFIG_HOME=/xdg')).toBe(
      '/xdg/superProductivity/local-rest-api-token',
    );
  });

  it('uses ~/Library/Application Support on macOS', async () => {
    expect(
      await resolve('darwin', 'HOME=/Users/me\nXDG_CONFIG_HOME=/xdg'),
    ).toBe(
      '/Users/me/Library/Application Support/superProductivity/local-rest-api-token',
    );
  });

  it('uses APPDATA on Windows', async () => {
    expect(await resolve('win32', 'APPDATA=C:/Users/me/AppData/Roaming')).toBe(
      'C:/Users/me/AppData/Roaming/superProductivity/local-rest-api-token',
    );
  });
});
