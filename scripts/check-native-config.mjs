// Verifies the generated iOS project (after `expo prebuild`) has what a FREE Apple ID build needs.
// Used locally (prebuild in a Linux container) and in CI before spending Mac minutes.
// Usage: node scripts/check-native-config.mjs
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ios = join(process.cwd(), 'ios');
const target = readdirSync(ios).find(
  (d) => d !== 'Pods' && statSync(join(ios, d)).isDirectory() && readdirSync(join(ios, d)).includes('Info.plist'),
);
const entitlementsFile = readdirSync(join(ios, target)).find((f) => f.endsWith('.entitlements'));
const entitlements = entitlementsFile ? readFileSync(join(ios, target, entitlementsFile), 'utf8') : '';
const info = readFileSync(join(ios, target, 'Info.plist'), 'utf8');
const project = readFileSync(join(ios, `${target}.xcodeproj`, 'project.pbxproj'), 'utf8');

const checks = [
  ['no push entitlement (free Apple IDs cannot provision aps-environment)', !entitlements.includes('aps-environment')],
  ['background location mode', /<key>UIBackgroundModes<\/key>\s*<array>[\s\S]*?<string>location<\/string>/.test(info)],
  ['Always-location explanation', info.includes('NSLocationAlwaysAndWhenInUseUsageDescription')],
  ['can open SideStore (LSApplicationQueriesSchemes)', /<string>sidestore<\/string>/.test(info)],
  ...['heartbeat.wav', 'chime.wav', 'bubble.wav', 'twinkle.wav'].map((s) => [`bundles ${s}`, project.includes(s)]),
];

let failed = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failed++;
}
process.exit(failed ? 1 : 0);
