import { Text, View } from 'react-native';

export default function BuildCheck() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 48 }}>💗</Text>
      <Text>Build check OK — same native setup as the real app.</Text>
    </View>
  );
}
