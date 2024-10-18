import React, { useEffect, useState } from 'react';
import { IonToast } from '@ionic/react';
import { toast } from 'react-toastify'
import { Network } from '@capacitor/network';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Capacitor } from '@capacitor/core';

export const getNetworkStatus = async () => {
    const status = await Network.getStatus();
    console.log(status);
    if (status.connected) {
        const connection = navigator.connection;

        if (connection) {
          console.log(connection)
          const { downlink } = connection;
  
          console.log(downlink,"downlink")

          // Assume network is slow if the downlink is less than 1.5Mbps
          if (downlink < 1.5 && downlink > 0) {
            toast.info("Your network connection is slow");
          }
        }
        return true;
    } else {
        toast.dismiss();
        toast.error("Your device is offline", {
            autoClose: 2000,
        });
        return false;
    }
}