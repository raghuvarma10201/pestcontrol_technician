import { Capacitor } from "@capacitor/core";
import { Geolocation, PositionOptions } from "@capacitor/geolocation";
import { Diagnostic } from '@ionic-native/diagnostic';

import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css

export const getCurrentLocation = async () => {
  try {
    if (Capacitor.getPlatform() === 'android') {
      const isLocationEnabled = await Diagnostic.isLocationEnabled();
      if(!isLocationEnabled){
        if (Capacitor.getPlatform() === 'android') {
          confirmAlert({
            message: 'Please enable location services!',
            buttons: [
              {
                label: 'Enable',
                onClick: async () => {
                  await Diagnostic.switchToLocationSettings();
                }
              },
              {
                label: 'Cancel',
                onClick: () => {
                  console.log('cancelled');
                }
              }
            ]
          });

        } else {
          // For iOS or other platforms, guide the user to enable location services manually
          alert('Please enable location services in your device settings.');
          return null;
        }
      }else{
        const permissionStatus = await Geolocation.checkPermissions();
        console.log(permissionStatus);
        if (permissionStatus.location === 'granted') {
          const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: false, maximumAge: 30000 }); // cached location till 30 seconds 
          console.log("geoLocation ", position.coords);
          return position;
        }else {
          console.log('Location permission is not determined or restricted');
          const permission = await Geolocation.requestPermissions();
          console.log(permission);
          if (permission.location === 'granted') {
            const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: false, maximumAge: 30000 }); // cached location till 30 seconds 
            console.log("geoLocation ", position.coords);
            return position;
            // You can now access the user's location
          } else {
            console.log('Location permission is not determined or restricted');
            swal("Location permission are restricted");
            return null;
            // Handle other cases if necessary
          }
        }
      }
    }else{
      const position = await Geolocation.getCurrentPosition({enableHighAccuracy:false, maximumAge: 30000}); // cached location till 30 seconds 
      console.log("geoLocation ", position.coords);
      return position;
    } 
  } catch (e) {
    console.log("Geolocation Error or user not logged in.");
    return null;
  }
}