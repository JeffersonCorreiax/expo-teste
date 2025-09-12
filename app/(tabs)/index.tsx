import React, { useEffect, useRef, useState } from 'react';
import { Button, Text, View, StyleSheet } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function HomeScreen() {
  const [token, setToken] = useState<string | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);
  useEffect(() => {
    registerForPushNotificationsAsync().then(tok => setToken(tok));

    // listener quando o usuário clica/abre uma notificação
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
    });

    return () => {
      responseListener.current?.remove();
    };
  }, []);
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <Text>Token (envie pro backend):{token}</Text>
      <Text selectable style={{ marginVertical: 12 }}>{token ?? 'Obtendo token...'}</Text>

      <Button
        title="Enviar notificação local de teste"
        onPress={async () => {
          await Notifications.scheduleNotificationAsync({
            content: { title: 'Teste', body: 'Notificação local funcionando' },
            trigger: null,
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});

async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    alert('Precisa rodar em dispositivo físico para testar push nativo');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Permissão para notificações negada!');
    return null;
  }

  // Retorna token nativo (FCM no Android, APNs no iOS)
  const tokenData = await Notifications.getDevicePushTokenAsync();
  console.log('device push token', tokenData);
  return tokenData?.data ?? null;
}
