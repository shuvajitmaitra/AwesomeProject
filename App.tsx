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
        updateDialog: {
          appendReleaseDescription: true,
          descriptionPrefix: '\n\nChange log:\n',
          title: 'Update Available',
          mandatoryUpdateMessage: 'A mandatory update is required to continue.',
          mandatoryContinueButtonLabel: 'Install Now',
          optionalUpdateMessage:
            'An update is available. Would you like to install it?',
          optionalInstallButtonLabel: 'Install',
          optionalIgnoreButtonLabel: 'Ignore',
        },
        installMode: codePush.InstallMode.ON_NEXT_RESTART,
        mandatoryInstallMode: codePush.InstallMode.IMMEDIATE,
      },
      status => {
        switch (status) {
          case codePush.SyncStatus.CHECKING_FOR_UPDATE:
            Alert.alert('Update Status', 'Checking for updates...');
            break;
          case codePush.SyncStatus.DOWNLOADING_PACKAGE:
            Alert.alert('Update Status', 'Downloading package...');
            break;
          case codePush.SyncStatus.INSTALLING_UPDATE:
            Alert.alert('Update Status', 'Installing update...');
            break;
          case codePush.SyncStatus.UP_TO_DATE:
            Alert.alert('Update Status', 'App is up to date.');
            break;
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
          case codePush.SyncStatus.UPDATE_IGNORED:
            Alert.alert('Update Status', 'Update was ignored by the user.');
            break;
          case codePush.SyncStatus.UNKNOWN_ERROR:
            Alert.alert(
              'Update Error',
              'An unknown error occurred during the update process.',
            );
            break;
          case codePush.SyncStatus.SYNC_IN_PROGRESS:
            Alert.alert(
              'Update Status',
              'Another sync operation is in progress.',
            );
            break;
          case codePush.SyncStatus.AWAITING_USER_ACTION:
            Alert.alert(
              'Update Status',
              'Awaiting user action for update installation.',
            );
            break;
        }
      },
      ({ receivedBytes, totalBytes }) => {
        Alert.alert(
          'Download Progress',
          `Downloaded ${receivedBytes} of ${totalBytes} bytes.`,
        );
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
        Update Available 4.0
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
