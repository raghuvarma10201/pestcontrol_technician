import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCol,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonList,
  IonPage,
  IonRow,
  IonText,
  IonThumbnail,
  IonTitle,
  IonToolbar,
  IonProgressBar,
} from "@ionic/react";
import { useState, useEffect } from "react";
import { useHistory } from "react-router";
import CustomBackButton from "../components/CustomBackButton";
import CommonHeader from "../components/CommonHeader";
import TaskDetailItems from "../components/TaskDetailItems";
import { ellipse } from "ionicons/icons";
import {
  checkOngoingTask,
  fetchOtherTaskDetails,
  fetchTaskDetails,
  getVisitExecutionDetails,
  updateOtherTask,
} from "../data/apidata/taskApi/taskDataApi";
import { useParams } from "react-router-dom";
import { taskInit } from "../data/apidata/taskApi/taskDataApi";
import { formatDate, formatDateTime, formatDateTime2, getDate, getDateTime } from "../utils/dateTimeUtils";
import CustomAlert from "../components/CustomAlert";
import {
  retrieveNetworkTasksDetails,
  retrieveNetworkTasksExecutionDetails,
} from "../data/offline/entity/DataRetriever";
import TaskProgress, {
  saveTaskProgress,
  setStartStatus,
  updateTaskProgressStatusFromExecDetails,
} from "../data/localstorage/taskStatusStorage";
import { pencil, arrowBack } from "ionicons/icons";
import { Network } from "@capacitor/network";
import { submitTaskStart } from "../data/offline/entity/DataTransfer";
import { toast, ToastContainer } from "react-toastify";
import NotificationLength from "../components/NotificationLength";

const OtherTaskDetails: React.FC = () => {
  const params: any = useParams();
  // const { id } = useParams<{ id: string }>(); // Dynamically fetch taskId from URL
  const [taskDetails, setTaskDetails] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [isStartingTask, setIsStartingTask] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [nextButton, setNextButton] = useState<string>("Start");
  const [error, setError] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);

  // const [taskId, settaskId] =  useState <string >();
  let taskId = "";
  const history = useHistory();

  useEffect(() => {

    loadTaskFromParams();
    fetchTDetails(taskId);
    // fetchTaskDetails(taskId)
  }, []); // Execute useEffect whenever taskId changes

  const fetchTDetails = async (taskId: any) => {
    console.log("Going to fetch Task Details for task ID ::::", taskId);
    setLoading(true); // Start loading

    try {
      const response = await fetchOtherTaskDetails(taskId);
      if (response) {
        console.log("Fetched task details:", response);
        const taskData = response.data[0];

        // Set next button based on task status
        if (taskData.start_time == null && taskData.end_time == null) {
          setNextButton("Start Task");
        } else if (taskData.start_time != null && taskData.end_time == null) {
          setNextButton("End Task"); // Assuming it should be Close for Completed
        } else {
          setNextButton("Task Completed"); // Assuming it should be Start for other statuses
        }
        setTaskDetails(taskData);
      } else {
        console.error("Failed to fetch task details. Error:", response.message);
        // toast.error('Server not responding. Please try again later.');
      }
    } catch (error) {
      console.error("Error fetching task details:", error);
      // toast.error('Server not responding. Please try again later.');
      // Handle error state if needed
    } finally {
      setLoading(false); // End loading
    }
  };

  const loadTaskFromParams = () => {
    // console.log("id from params = ", id);
    console.log("LOADING task ID from params = ", params);
    console.log("params wise task id ", params.taskId);
    // setActiveTaskId(params.id)
    // id = params.taskId
    taskId = params.taskId;
    console.log("active task id ", taskId);
  };
  const taskData: any = [
    {
      key: "1",
      icon: "service-icon.svg",
      labelTxt: "Task Name",
      valueTxt: taskDetails.task_name || "Not available",
    },
    {
      key: "2",
      icon: "transaction-id-icon.svg",
      labelTxt: "Task Type",
      valueTxt: taskDetails.treatment_name || "Not available",
    },
    {
      key: "3",
      icon: "appointment-icon.svg",
      labelTxt: "Task Date",
      valueTxt: taskDetails.scheduled_time
        ? formatDateTime2(taskDetails.created_on)
        : "Not available",
    },
    
    {
      key: "4",
      icon: "appointment-icon.svg",
      labelTxt: "Start Time",
      valueTxt: taskDetails.start_time
        ? formatDateTime2(taskDetails.start_time)
        : "Not available",
    },
    
    {
      key: "5",
      icon: "appointment-icon.svg",
      labelTxt: "End Time",
      valueTxt: taskDetails.end_time
        ? formatDateTime2(taskDetails.end_time)
        : "Not available",
    },
    
    {
      key: "6",
      icon: "service-icon.svg",
      labelTxt: "comments",
      valueTxt: taskDetails.comments
        ? taskDetails.comments
        : "Not available",
    },
  ];

  const handleNavigateToList = () => {

    history.push({
      pathname: "/MaterialList",
      state: { showAlert: true },
    });
  };
  const startTask = async () => {
    const isOngoing: any = await checkOngoingTask();
    console.log("isOngoing", isOngoing);

    try {
      if (taskDetails.start_time == null && taskDetails.end_time == null) {
        if (isOngoing.is_user_on_job == true) {
          toast.info(
            "Please complete or pause the ongoing task before starting or resuming another one.",
            { autoClose: 3000 }
          );
          return;
        } else {
          console.log("taskData.service_status == On Going ");
          try {
            const formattedDate = getDateTime();
            const payload = {
              id: taskDetails.id,
              start_time: formattedDate
            }
            console.log(payload);
            const response = await updateOtherTask(payload);
            console.log(response);
            fetchTDetails(taskDetails.id);
          } catch (error) {
            console.error("Error:", error);
            // toast.error('Server not responding. Please try again later.');
          }
        }
        //history.push("/taskexecution");
      } else if (taskDetails.start_time !== null && taskDetails.end_time == null) {
        try {
            const formattedDate = getDateTime();
            const payload = {
              id: taskDetails.id,
              end_time: formattedDate
            }
            console.log(payload);
            const response = await updateOtherTask(payload);
            console.log(response);
            fetchTDetails(taskDetails.id);
          } catch (error) {
            console.error("Error:", error);
            // toast.error('Server not responding. Please try again later.');
          }
      } else {

      }
    } catch (error) {
      console.error("Error:", error);
      // toast.error('Server not responding. Please try again later.');
    } finally {
    }
    console.log("Start or Continue Task . task data = ", taskDetails);

  };
  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  // const navigateToTaskExe = () => {
  //   history.push("/taskexecution");
  // };

  const alertButtons = [
    {
      text: "Close",
      cssClass: "alert-button-cancel",
      role: "close",
      handler: () => handleCloseAlert(),
    },
  ];
  const goBack = () => {
    history.goBack();
  };
  return (
    <>
      <ToastContainer />
      <IonHeader
        translate="yes"
        className="ion-no-border ion-padding-horizontal"
      >
        <IonToolbar>
          <IonButtons slot="start" className="ion-no-padding">
            <IonBackButton defaultHref={"/"}></IonBackButton>
          </IonButtons>
          <IonTitle className="ion-float-start"> Task Details</IonTitle>
          <div className="ion-float-end headerBts">
            <IonButton shape="round" routerLink={"/"}>
              <IonImg src="assets/images/home-outline-icon.svg" />
            </IonButton>

            <NotificationLength />
            <IonButton shape="round" routerLink={"/profile"}>
              <IonImg src="assets/images/account-user.svg" />
            </IonButton>
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent
        fullscreen
        className="dashboardWrapp ionContentColor ion-padding-horizontal"
      >
        {loading && <IonProgressBar type="indeterminate" />}
        <div className="ionPaddingBottom">
          <IonList lines="full" className="ion-list-item ">
            {taskData.length > 0 &&
              taskData.map((obj: any, index: any) => {
                const { icon, labelTxt, valueTxt, key } = obj;
                return (
                  <TaskDetailItems
                    icon={icon}
                    labelTxt={labelTxt}
                    valueTxt={valueTxt}
                    key={key}
                  />
                );
              })}
          </IonList>
        </div>

      </IonContent>
      <IonFooter className="ion-footer">
        <IonToolbar className="ionFooter">
          <IonButton
            className="ion-button"
            expand="full"
            color={"primary"}
            onClick={(e) => startTask()}
          >
            {nextButton}
          </IonButton>
        </IonToolbar>
      </IonFooter>

      <CustomAlert
        isOpen={showAlert}
        subHeader="Please collect insufficient materials at the warehouse today."
        message="click here to see the list"
        buttons={alertButtons}
        onClose={handleCloseAlert}
        onMessageClick={handleNavigateToList}
      />
    </>
  );
};

export default OtherTaskDetails;
