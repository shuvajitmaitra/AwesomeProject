import codePush from '@revopush/react-native-code-push';
import {
  Text,
  StyleSheet,
  View,
  Alert,
  Button,
  AppState,
  AppStateStatus,
} from 'react-native';
import { useEffect, useRef } from 'react';

function App() {
  const appState = useRef(AppState.currentState);

  const syncWithCodePush = () => {
    codePush.sync(
      {
        installMode: codePush.InstallMode.ON_NEXT_RESTART,
        mandatoryInstallMode: codePush.InstallMode.IMMEDIATE,
      },
      status => {
        switch (status) {
          case codePush.SyncStatus.UPDATE_INSTALLED:
            Alert.alert(
              'Update Installed',
              'Update has been installed. Restart the app to apply changes?',
              [
                {
                  text: 'Later',
                  style: 'cancel',
                },
                {
                  text: 'Restart Now',
                  onPress: () => codePush.restartApp(),
                },
              ],
            );
            break;
          case codePush.SyncStatus.UNKNOWN_ERROR:
            Alert.alert(
              'Update Error',
              'An unknown error occurred during the update process.',
            );
            break;
        }
      },
    );
  };

  const clearCodePushUpdates = () => {
    Alert.alert(
      'Clear Updates',
      'Are you sure you want to clear all downloaded CodePush updates? This will revert the app to its bundled state and require a restart.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          onPress: () => {
            codePush.clearUpdates();
            Alert.alert(
              'Updates Cleared',
              'All CodePush updates have been cleared. Restart the app to apply changes?',
              [
                { text: 'Later', style: 'cancel' },
                { text: 'Restart Now', onPress: () => codePush.restartApp() },
              ],
            );
          },
        },
      ],
    );
  };

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        syncWithCodePush();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    // Initial sync on app start
    syncWithCodePush();

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>
        Check new function
      </Text>
      <Button title="Clear CodePush Updates" onPress={clearCodePushUpdates} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
  },
});

export default codePush({
  checkFrequency: codePush.CheckFrequency.MANUAL,
})(App);
