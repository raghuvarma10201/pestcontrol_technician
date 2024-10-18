import React, { useEffect, useState } from 'react';
import { Network } from '@capacitor/network';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonText, IonButton, IonBackdrop, IonIcon } from '@ionic/react';
import './AppUpdate.css';
import { cloudDownloadOutline, refresh } from 'ionicons/icons';
import { toast } from 'react-toastify';
import { App } from '@capacitor/app';
import { Device } from '@capacitor/device';
import { appSettings } from '../data/apidata/authApi/dataApi';

const AppUpdate: React.FC = () => {
    const [isUpdateAvailable, setUpdateAvailable] = useState<boolean>(false);
    const [updateLink, setUpdateLink] = useState<string>('');

    useEffect(() => {
        checkUpdate();
        const updateInterval = setInterval(checkUpdate, 30000); // Fetch geolocation every 30 seconds
        // Clear intervals on component unmount
        return () => {
            clearInterval(updateInterval);
        };
    }, []);

    const checkUpdate = async () => {
        try {
            const info = await Device.getInfo();
            const platform = info.platform;
            const AppSettings = await appSettings();
            console.log(AppSettings);
            console.log(platform);
            if (AppSettings && AppSettings.data.success) {
                if (platform === 'ios' || platform === 'android') {
                    console.log('Running on Device');
                    const appInfos = await App.getInfo();
                    localStorage.setItem('app_version', appInfos.version);
                    if (platform === 'android') {
                        const AndroidVersion = AppSettings.data.data.find((setting: any) => setting.title === "Pest_Control_Android_Version");
                        console.log(AndroidVersion);
                        if (AndroidVersion.description > appInfos.version) {
                            const appLink = AppSettings.data.data.find((setting: any) => setting.title === "Pest_Control_Android_App_link");
                            setUpdateLink(appLink.description);
                            setUpdateAvailable(true);
                        }else{
                            setUpdateAvailable(false);
                        }
                    }
                    if (platform === 'ios') {
                        const IosVersion = AppSettings.data.data.find((setting: any) => setting.title === "Pest_Control_IOS_Version");
                        console.log(IosVersion);
                        if (IosVersion.description > appInfos.version) {
                            const appLink = AppSettings.data.data.find((setting: any) => setting.title === "Pest_Control_IOS_App_link");
                            setUpdateLink(appLink.description);
                            setUpdateAvailable(true);
                        }else{
                            setUpdateAvailable(false);
                        }
                    }

                } else {
                    console.log('Running on Web');
                    localStorage.setItem('app_version', 'web');
                }
            } else {
                console.error("Failed to fetch app settings", AppSettings);
                toast.error("Server not responding. Please try again later.");
            }


        } catch (error) {
            console.error('Error getting device info:', error);
        } finally {

        }
    };
    const updateApp = async () => {
        const keysToKeep = ['device_token', 'rememberedUserName', 'rememberedPassword','app_name','app_version'];
        const savedValues = keysToKeep.map(key => ({ key, value: localStorage.getItem(key) }));
        localStorage.clear();
        savedValues.forEach(({ key, value }) => {
            if (value !== null) {
            localStorage.setItem(key, value);
            }
        });
        window.open(updateLink, '_blank');
    };
    
    return (
        <>
            {isUpdateAvailable && (
                <IonPage className='offline-overlay'>
                    <IonContent className="ion-padding update-content">
                        <div className="update-container">
                            <IonIcon
                                icon={cloudDownloadOutline}
                                className="update-icon"
                            />
                            <h2 className="update-title">A New Version is Available!</h2>
                            <p className="update-message">
                                Please update to the latest version to enjoy new features and improvements.
                            </p>
                            <IonButton
                                expand="full"
                                color="secondary"
                                className="update-button"
                                onClick={updateApp}
                            >
                                Update Now
                            </IonButton>
                        </div>
                    </IonContent>
                </IonPage>)}
        </>
    );
};

export default AppUpdate;
