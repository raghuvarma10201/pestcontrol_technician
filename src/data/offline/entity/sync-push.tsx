import { Storage } from "@ionic/storage";
import { Network } from "@capacitor/network";
import { API_BASE_URL } from "../../baseUrl";
import { getUserData } from "../../apidata/taskApi/taskDataApi";

enum task_tx_steps {
  taskStart = 1,
  attendance,
  startTravel,
  endTravel,
  pestActivity,
  chemsUsed,
  recommendations,
  workDone,
  feedbackFollowup,
  PauseResume,
}

const httpPostRequest = async (url: string, payload: any) => {
  const userData = getUserData();
  let httpReqObj = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userData?.api_token}`,
    },
    body: JSON.stringify(payload),
  };
  const response = await fetch(url, httpReqObj);
  if (!response.ok) {
    console.error(
      "SYNC PUSH: Failed to POST data, url = ",
      url,
      "  ; payload = ",
      payload,
      "; response status : ",
      response.status,
      "; response body : ",
      response.body
    );
    return false;
  }
  return true;
};

export const syncPush = async () => {
  // build db obj
  let storage = new Storage();
  await storage.create();

  // Check for tasks in otx-tasks-executed
  let otxTasksExecuted = await storage.get("otx-tasks-executed");

  if (!otxTasksExecuted || otxTasksExecuted.length == 0) {
    // If null or empty or zero length
    // return 0 to show the message "No offline transactions to upload."
  } else if (otxTasksExecuted && otxTasksExecuted.length > 0) {
    // If > 0 start sync

    // loop tasks in otx-tasks-executed
    for (let index = 0; index < otxTasksExecuted.length; index++) {
      const taskId = otxTasksExecuted[index];
      // get otx-seq-<taskId> and loop
      const otxSeqArray = await storage.get("otx-seq-" + taskId);
      for (let index = 0; index < otxSeqArray.length; index++) {
        const otx = otxSeqArray[index];

        switch (otx) {
          case task_tx_steps.taskStart:
            // Define URL, create headers, post data
            let urlStart = `${API_BASE_URL}/task-initiate`;
            let payloadStart = await storage.get("otx-task-start-" + taskId);
            console.log("payloadStart----------------->", payloadStart);
            let pushStatusStart = await httpPostRequest(urlStart, payloadStart);
            // On success pop the tx from array
            if (pushStatusStart) {
              storage.remove("otx-task-start-" + taskId);
            } else {
              // On failure retry 3 times, inform user, save the updated array into DB
              for (let j = 0; j < 3; j++) {
                pushStatusStart = await httpPostRequest(urlStart, payloadStart);
                if (pushStatusStart) {
                  storage.remove("otx-task-start-" + taskId);
                  break;
                }
              }
              if (!pushStatusStart) {
                // Inform user and save the updated array into DB
                console.log("Failed to push task start data after 3 attempts.");
                // Implement saving to DB logic here
              }
            }
            break;

          case task_tx_steps.attendance:
            let urlAttendance = `${API_BASE_URL}/add-team-attendance`;
            let payloadAttendance = await storage.get(
              "otx-teamAttendance-" + taskId
            );
            console.log(
              "payloadAttendance----------------->",
              payloadAttendance
            );
            let pushStatusAttendance = await httpPostRequest(
              urlAttendance,
              payloadAttendance
            );
            if (pushStatusAttendance) {
              storage.remove("otx-teamAttendance-" + taskId);
            } else {
              // On failure retry 3 times, inform user, save the updated array into DB
              for (let j = 0; j < 3; j++) {
                pushStatusAttendance = await httpPostRequest(
                  urlAttendance,
                  payloadAttendance
                );
                if (pushStatusAttendance) {
                  storage.remove("otx-teamAttendance-" + taskId);
                  break;
                }
              }
              if (!pushStatusAttendance) {
                console.log("Failed to push attendance data after 3 attempts.");
                // Implement saving to DB logic here
              }
            }
            break;

          case task_tx_steps.startTravel:
            let urlStartTravel = `${API_BASE_URL}/task-initiate`;
            let payloadStartTravel = await storage.get(
              "otx-Start-TrackTime-" + taskId
            );
            console.log(
              "payloadStartTravel----------------->",
              payloadStartTravel
            );
            let pushStatusStartTravel = await httpPostRequest(
              urlStartTravel,
              payloadStartTravel
            );
            if (pushStatusStartTravel) {
              storage.remove("otx-Start-TrackTime-" + taskId);
            } else {
              // On failure retry 3 times, inform user, save the updated array into DB
              for (let j = 0; j < 3; j++) {
                pushStatusStartTravel = await httpPostRequest(
                  urlStartTravel,
                  payloadStartTravel
                );
                if (pushStatusStartTravel) {
                  storage.remove("otx-Start-TrackTime-" + taskId);
                  break;
                }
              }
              if (!pushStatusStartTravel) {
                console.log(
                  "Failed to push start travel data after 3 attempts."
                );
                // Implement saving to DB logic here
              }
            }
            break;

          case task_tx_steps.endTravel:
            let urlEndTravel = `${API_BASE_URL}/task-initiate`;
            let payloadEndTravel = await storage.get(
              "otx-End-TrackTime-" + taskId
            );
            console.log("payloadEndTravel----------------->", payloadEndTravel);
            let pushStatusEndTravel = await httpPostRequest(
              urlEndTravel,
              payloadEndTravel
            );
            if (pushStatusEndTravel) {
              storage.remove("otx-End-TrackTime" + taskId);
            } else {
              // On failure retry 3 times, inform user, save the updated array into DB
              for (let j = 0; j < 3; j++) {
                pushStatusEndTravel = await httpPostRequest(
                  urlEndTravel,
                  payloadEndTravel
                );
                if (pushStatusEndTravel) {
                  storage.remove("otx-End-TrackTime-" + taskId);
                  break;
                }
              }
              if (!pushStatusEndTravel) {
                console.log("Failed to push end travel data after 3 attempts.");
                // Implement saving to DB logic here
              }
            }
            break;

          case task_tx_steps.pestActivity:
            let urlPestActivity = `${API_BASE_URL}/add-pest-found-details`;
            let payloadPestActivity = await storage.get(
              "otx-pestData-" + taskId
            );
            console.log(
              "payloadPestActivity----------------->",
              payloadPestActivity
            );
            let pushStatusPestActivity = await httpPostRequest(
              urlPestActivity,
              payloadPestActivity
            );
            if (pushStatusPestActivity) {
              storage.remove("otx-pestData-" + taskId);
            } else {
              // On failure retry 3 times, inform user, save the updated array into DB
              for (let j = 0; j < 3; j++) {
                pushStatusPestActivity = await httpPostRequest(
                  urlPestActivity,
                  payloadPestActivity
                );
                if (pushStatusPestActivity) {
                  storage.remove("otx-pestData-" + taskId);
                  break;
                }
              }
              if (!pushStatusPestActivity) {
                console.log(
                  "Failed to push pest activity data after 3 attempts."
                );
                // Implement saving to DB logic here
              }
            }
            break;

          case task_tx_steps.chemsUsed:
            let urlChemsUsed = `${API_BASE_URL}/insert-chemicals-used-for-pest`;
            let payloadChemsUsed = await storage.get("otx-chem-used-" + taskId);
            console.log("payloadChemsUsed----------------->", payloadChemsUsed);
            let pushStatusChemsUsed = await httpPostRequest(
              urlChemsUsed,
              payloadChemsUsed
            );
            if (pushStatusChemsUsed) {
              storage.remove("otx-chem-used-" + taskId);
            } else {
              // On failure retry 3 times, inform user, save the updated array into DB
              for (let j = 0; j < 3; j++) {
                pushStatusChemsUsed = await httpPostRequest(
                  urlChemsUsed,
                  payloadChemsUsed
                );
                if (pushStatusChemsUsed) {
                  storage.remove("otx-chem-used-" + taskId);
                  break;
                }
              }
              if (!pushStatusChemsUsed) {
                console.log("Failed to push chems used data after 3 attempts.");
                // Implement saving to DB logic here
              }
            }
            break;

          case task_tx_steps.recommendations:
            let urlRecommendations = `${API_BASE_URL}/add-pest-recommendation`;
            let payloadRecommendations = await storage.get(
              "otx-pest-recommendation-" + taskId
            );
            console.log(
              "payloadRecommendations----------------->",
              payloadRecommendations
            );
            let pushStatusRecommendations = await httpPostRequest(
              urlRecommendations,
              payloadRecommendations
            );
            if (pushStatusRecommendations) {
              storage.remove("otx-pest-recommendation-" + taskId);
            } else {
              // On failure retry 3 times, inform user, save the updated array into DB
              for (let j = 0; j < 3; j++) {
                pushStatusRecommendations = await httpPostRequest(
                  urlRecommendations,
                  payloadRecommendations
                );
                if (pushStatusRecommendations) {
                  storage.remove("otx-pest-recommendation-" + taskId);
                  break;
                }
              }
              if (!pushStatusRecommendations) {
                console.log(
                  "Failed to push recommendations data after 3 attempts."
                );
                // Implement saving to DB logic here
              }
            }
            break;

          case task_tx_steps.workDone:
            let urlWorkDone = `${API_BASE_URL}/add-work-done-detail`;
            let payloadWorkDone = await storage.get("otx-work-done-" + taskId);
            console.log("payloadWorkDone----------------->", payloadWorkDone);
            let pushStatusWorkDone = await httpPostRequest(
              urlWorkDone,
              payloadWorkDone
            );
            if (pushStatusWorkDone) {
              storage.remove("otx-work-done-" + taskId);
            } else {
              for (let j = 0; j < 3; j++) {
                pushStatusWorkDone = await httpPostRequest(
                  urlWorkDone,
                  payloadWorkDone
                );
                if (pushStatusWorkDone) {
                  storage.remove("otx-work-done-" + taskId);
                  break;
                }
              }
              if (!pushStatusWorkDone) {
                console.log("Failed to push work done data after 3 attempts.");
                // Implement saving to DB logic here
              }
            }
            break;

          case task_tx_steps.feedbackFollowup:
            let urlFeedbackFollowup = `${API_BASE_URL}/add-followup-feedback-details`;
            let payloadFeedbackFollowup = await storage.get(
              "otx-followup-feedback-" + taskId
            );
            console.log(
              "payloadFeedbackFollowup----------------->",
              payloadFeedbackFollowup
            );
            let pushStatusFeedbackFollowup = await httpPostRequest(
              urlFeedbackFollowup,
              payloadFeedbackFollowup
            );
            if (pushStatusFeedbackFollowup) {
              storage.remove("otx-followup-feedback-" + taskId);
            } else {
              for (let j = 0; j < 3; j++) {
                pushStatusFeedbackFollowup = await httpPostRequest(
                  urlFeedbackFollowup,
                  payloadFeedbackFollowup
                );
                if (pushStatusFeedbackFollowup) {
                  storage.remove("otx-followup-feedback-" + taskId);
                  break;
                }
              }
              if (!pushStatusFeedbackFollowup) {
                console.log(
                  "Failed to push feedback follow-up data after 3 attempts."
                );
                // Implement saving to DB logic here
              }
            }
            break;

            case task_tx_steps.PauseResume:
            let urlPauseResume = `${API_BASE_URL}/visit-time-intervals`;
            let payloadPauseResume = await storage.get("otx-task-PauseResume-" + taskId);
            let pushStatusPauseResume = await httpPostRequest(
              urlPauseResume,
              payloadPauseResume
            );
            if (pushStatusPauseResume) {
              storage.remove("otx-task-PauseResume-" + taskId);
            } else {
              // On failure retry 3 times, inform user, save the updated array into DB
              for (let j = 0; j < 3; j++) {
                pushStatusPauseResume = await httpPostRequest(
                  urlPauseResume,
                  payloadPauseResume
                );
                if (pushStatusPauseResume) {
                  storage.remove("otx-task-PauseResume-" + taskId);
                  break;
                }
              }
              if (!pushStatusPauseResume) {
                console.log("Failed to push chems used data after 3 attempts.");
                // Implement saving to DB logic here
              }
            }
            break;

          default:
            console.log(
              "Invalid transaction recorded in offline. Recheck the task_tx_steps used."
            );
            break;
        }
      }
      await storage.remove("otx-seq-" + taskId);
    }
    await storage.remove("otx-tasks-executed");
    // Clear masterdata and offline transactions
    await storage.clear();
  }
};
