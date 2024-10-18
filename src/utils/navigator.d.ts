interface NetworkInformation extends EventTarget {
    downlink: number;
    effectiveType: string;
    rtt: number;
    saveData: boolean;
  }
  
  interface Navigator {
    connection?: NetworkInformation;
  }
  