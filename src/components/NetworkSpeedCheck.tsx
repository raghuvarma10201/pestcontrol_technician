import React, { useEffect, useState } from 'react';
import { IonAlert, IonToast } from '@ionic/react';
import { toast } from 'react-toastify'
import { Network } from '@capacitor/network';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Capacitor } from '@capacitor/core';

const NetworkSpeedCheck: React.FC = () => {
  const [showToast, setShowToast] = useState(false);

  const [isConnected, setIsConnected] = useState<boolean>(true);

  useEffect(() => {
    const checkNetworkStatus = async () => {
      const status = await Network.getStatus();
      console.log(status);
      setIsConnected(status.connected);
      const connection = navigator.connection;

      if (connection) {
        console.log(connection)
        const { downlink } = connection;

        console.log(downlink, "downlink")

        // Assume network is slow if the downlink is less than 1.5Mbps
        if (downlink < 1.5 && downlink > 0) {
          toast.dismiss();
          toast.info("Your network connection is slow", { autoClose: 1500, });
        }

      }
    };

    // Check the network status initially
    checkNetworkStatus();

    // Set up an interval to check network status every 10 seconds
    const interval = setInterval(checkNetworkStatus, 60000);

    // Add a listener to monitor network status changes
    const handleNetworkChange = (status: any) => {
      setIsConnected(status.connected);
    };

    Network.addListener('networkStatusChange', handleNetworkChange);


    // Cleanup the interval and listener on component unmount
    return () => {
      clearInterval(interval);

    };
  }, []);
  return (
    <>
      {/* <IonToast
        position='middle'
        isOpen={!isConnected}
        color='danger'
        buttons={[
          {
            text: 'Dismiss',
            role: 'cancel',
          },
        ]}
        onDidDismiss={() => setShowToast(false)}
        message="Your device is offline"
      //duration={2000}
      /> */}
      <IonToast
        position='bottom'
        isOpen={isConnected}
        color='success'
        buttons={[
          {
            text: 'Dismiss',
            role: 'cancel',
          },
        ]}
        onDidDismiss={() => setShowToast(false)}
        message="Your device is online"
        duration={2000}
      />
      <IonAlert

        isOpen={!isConnected}
        header='Device offline'
        subHeader='Please Check your internet connection'
        buttons={[
          {
            text: 'OK',
            role: 'confirm',
            handler: () => {
              console.log('Alert confirmed');
            },
          },
        ]}
        onDidDismiss={async ({ detail }) => {
          if (Capacitor.getPlatform() === 'android') {
            await Diagnostic.switchToMobileDataSettings();
          }
        }}
      ></IonAlert>
    </>


  );
};

export default NetworkSpeedCheck;
