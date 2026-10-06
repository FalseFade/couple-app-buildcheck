// expo-notifications always adds the APNs entitlement ("aps-environment"). A free Apple ID
// cannot provision push, and this app only uses LOCAL notifications, so we remove it.
const { withEntitlementsPlist } = require('expo/config-plugins');

module.exports = function withoutPushEntitlement(config) {
  return withEntitlementsPlist(config, (mod) => {
    delete mod.modResults['aps-environment'];
    return mod;
  });
};
