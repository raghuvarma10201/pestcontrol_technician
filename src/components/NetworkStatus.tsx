import React, { useEffect, useState } from 'react';
import { Network } from '@capacitor/network';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonText, IonButton, IonBackdrop, IonIcon } from '@ionic/react';
import './NetworkStatus.css';
import { refresh } from 'ionicons/icons';

const NetworkStatus: React.FC = () => {
    const [isConnected, setIsConnected] = useState<boolean>(true);

    useEffect(() => {
      const checkNetworkStatus = async () => {
        const status = await Network.getStatus();
        setIsConnected(status.connected);
      };
  
      // Check network status initially
      checkNetworkStatus();
  
      // Add listener for network status changes
      const handleNetworkChange = (status: any) => {
        setIsConnected(status.connected);
      };
  
      Network.addListener('networkStatusChange', handleNetworkChange);
  
      // Cleanup listener on unmount
      return () => {
        Network.removeListener('networkStatusChange', handleNetworkChange);
      };
    }, []);
  
    const retryConnection = async () => {
      const status = await Network.getStatus();
      setIsConnected(status.connected);
    };

  return (
    <>
    {!isConnected && (
          <>
            <div className="offline-overlay">
              <IonText>
                <h2>No Internet Connection</h2>
                <p>Please check your internet connection and try again.</p>
                <IonButton expand="full" onClick={retryConnection}>
                  <IonIcon icon={refresh} slot="start" />
                  Retry
                </IonButton>
              </IonText>
            </div>
          </>
        )}
    </>
  );
};

export default NetworkStatus;
