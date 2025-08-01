import { IonImg, IonItem, IonText, IonThumbnail } from '@ionic/react'
import React from 'react'


const OtherTaskComponent: React.FC<any> = ({ id, path, title, subTitle, date, serviceDate, status,imgSrc }) => {

    const formatTime = (time: string | undefined) => {
        if (!time) return ''; // Handle undefined time gracefully

        let [hours, minutes] = time.split(':').map(Number);
        // let ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        let formattedTime = `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
        return formattedTime;
    }

    // const formatTime = (time: string | undefined) => {
    //   const date = new Date(time);
    // const options: Intl.DateTimeFormatOptions = {
    //   year: "numeric",
    //   month: "short",
    //   day: "numeric",

    // };

    // return date.toLocaleString("en-US", options);
    // }


    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = {
            year: "numeric",
            month: "short",
            day: "numeric",


        };

        return date.toLocaleString("en-US", options);
    };
    let statusClassName = '';
    switch (status) {
        case 'Completed':
            statusClassName = 'completedColor';
            break;
        case 'Pending':
            statusClassName = 'pendingColor';
            break;
        case 'Expired':
            statusClassName = 'expiredColor';
            break;
        case 'Paused':
            statusClassName = 'pausedColor';
            break;
        case 'On Going':
            statusClassName = 'ongoingColor';
            break;
        default:
            statusClassName = '';
    }
    return (
        <>
            <IonItem routerLink={path} style={{marginTop : "10px"}}>
                <IonThumbnail slot="start" class="thumbnailIcon" style={{marginTop : "auto"}}>
                    <IonImg src={imgSrc}></IonImg>
                </IonThumbnail>
                <div>
                    <IonText>
                        <h3>{title}</h3>
                        <h2> {subTitle} </h2>
                        <p style={{ fontWeight: "bold" }}>Service Date : <span>{formatDate(serviceDate)} </span>
                        </p>
                        <p style={{ fontWeight: "bold" }}>Created On : <span>{date}</span></p>
                    </IonText>
                     <IonText className="priorityText">
                        <h6>Status : <span className={statusClassName} style={{color:"#16BAC2"}}> {status} </span></h6>
                    </IonText>

                </div>
            </IonItem>
        </>
    )
}

export default OtherTaskComponent