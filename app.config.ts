import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Two variants, picked with APP_VARIANT:
 *  - "dev":  dev client (Metro over Wi-Fi), only on his phone, bundle id suffix .dev
 *  - "prod": the normal app on both phones (default)
 * Supabase URL/key come from EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY (.env).
 * EAS Update is switched on only when EAS_PROJECT_ID is set.
 */
const variant = process.env.APP_VARIANT === 'dev' ? 'dev' : 'prod';
const easProjectId = process.env.EAS_PROJECT_ID;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: variant === 'dev' ? 'Us (dev)' : 'Us',
  slug: 'couple-app',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: variant === 'dev' ? 'us-couple-dev' : 'us-couple',
  userInterfaceStyle: 'automatic',
  ios: {
    bundleIdentifier: variant === 'dev' ? 'com.falsefade.us.dev' : 'com.falsefade.us',
    supportsTablet: false,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      // Lets the app open SideStore (to refresh the 7-day signature) and Shortcuts.
      LSApplicationQueriesSchemes: ['sidestore', 'shortcuts'],
      NSLocalNetworkUsageDescription: 'Used only by the development build to reach the dev server.',
    },
  },
  android: {
    package: 'com.falsefade.us',
  },
  web: {
    // Single-page app: the session lives in browser storage, so no server-side pre-rendering.
    output: 'single',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    // Must stay FIRST: config-plugin mods run in reverse order, so the first plugin's change is
    // applied last — after expo-notifications has added "aps-environment".
    './plugins/without-push-entitlement.js',
    'expo-router',
    [
      'expo-splash-screen',
      { backgroundColor: '#FFF4F7', image: './assets/images/splash-icon.png', imageWidth: 120 },
    ],
    [
      'expo-location',
      {
        locationWhenInUsePermission: 'Us shows your partner where you are, only while you choose to share.',
        locationAlwaysAndWhenInUsePermission:
          'Us keeps sharing your location with your partner in the background, so pings and "home safe" alerts work even when the app is closed. You can pause it anytime.',
        isIosBackgroundLocationEnabled: true,
      },
    ],
    [
      'expo-notifications',
      {
        sounds: [
          './assets/sounds/heartbeat.wav',
          './assets/sounds/chime.wav',
          './assets/sounds/bubble.wav',
          './assets/sounds/twinkle.wav',
        ],
      },
    ],
    'expo-maps',
  ],
  updates: easProjectId ? { url: `https://u.expo.dev/${easProjectId}` } : { enabled: false },
  // "appVersion" instead of "fingerprint": the fingerprint can differ between Windows (eas update)
  // and the macOS CI build, which would make updates silently not apply.
  runtimeVersion: { policy: 'appVersion' },
  extra: {
    variant,
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
    ...(easProjectId ? { eas: { projectId: easProjectId } } : {}),
  },
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
