import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import {
  IonAlert,
  IonButton,
  IonContent,
  IonImg,
  IonItem,
  IonList,
  IonPage,
  IonSearchbar,
  IonTitle,
  IonToolbar,
  IonModal,
  IonHeader,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonLabel,
  IonProgressBar,
  IonSegment,
  IonSegmentButton,
  IonBadge,
  IonText,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
} from "@ionic/react";
import CommonHeader from "../components/CommonHeader";
import TaskComponent from "../components/TaskComponent";
import {
    fetchOtherTaskData,
  fetchTaskData,
  fetchTaskDetails,
  formatDate,
} from "../data/apidata/taskApi/taskDataApi";
import { formatTime, getDate, getJustDate } from "../utils/dateTimeUtils";
import { toast, ToastContainer } from "react-toastify";
import useLongitudeLocation from "../components/useLongitudeLocation";
import "react-toastify/dist/ReactToastify.css";
import { userCheckIn } from "../data/apidata/authApi/dataApi";
import {
  retrieveNetworkFilteredTasks,
  retrieveNetworkTasks,
} from "../data/offline/entity/DataRetriever";
import { retrieveNetworkTasksDetails } from "../data/offline/entity/DataRetriever";
import GoTop from "../components/GoTop";
import { Storage } from "@capacitor/storage";
import { getCurrentLocation } from "../data/providers/GeoLocationProvider";
import OtherTaskComponent from "../components/OtherTaskComponent";


const OtherTasks: React.FC = () => {
  const [taskData, setTaskData] = useState<any[]>([]);
  const [selectedSegment, setSelectedSegment] =
    useState<string>("pendingSegment");
  const [filteredTaskData, setFilteredTaskData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const history = useHistory();
  const location = useLongitudeLocation();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [filterError, setFilterError] = useState<boolean>(false);
  const [filterApplied, setFilterApplied] = useState(false);
  const searchInputRef = useRef<HTMLIonSearchbarElement>(null);
  const [filterCriteria, setFilterCriteria] = useState({
    service_date: "",
    service_status: "",
  });
  console.log("default date string = ", getJustDate());
  const [filterselectedCriterias, setselectedFilterCriteria] = useState({
    service_date: "",
    service_status: "",
  });
  const [pausedCount, setPausedCount] = useState(0);
  const [pendingOngoingCount, setPendingOngoingCount] = useState(0);
  const [expiredCount, setExpiredCount] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<string>("ROUTINE_ON_GOING | ROUTINE_PENDING");
  const [selectedPriority, setSelectedPriority] = useState("Medium");
  const [hasMoreTasks, setHasMoreTasks] = useState(true);
  const [page, setPage] = useState(0);

  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current === false) {
      getOtherTasks('',filterCriteria, 0);
      effectRan.current = true;
    }
  }, []);

  useEffect(() => {
    //getOnGoingNPendingTasks('', selectedStatus);
  }, [selectedSegment]);

  const getOtherTasks = async (searchText: any, filter : any,  page: any) => {

    let geolocation: any = await getCurrentLocation();

    setLoading(true);
    if (geolocation.coords.latitude && geolocation.coords.longitude) {
      let consolidatedData: Array<any> = [];
      setLoading(true);
      console.log("Fetching Task List from Tasks");
      // Fetch tasks with statuses 14 (pending), 17 (on-going), 33 (new status)
      let response = await fetchOtherTaskData(
        filter,
        geolocation.coords.latitude,
        geolocation.coords.longitude,
        searchText,
        page
      );
      console.log("Responseeeeeeeeee", response);
      let rawTaskList = response.data;
      console.log(rawTaskList);
      if (rawTaskList.length < 10) {
        setHasMoreTasks(false);
        setPage(0);
      } else {
        setHasMoreTasks(true)
        setPage(prevPage => prevPage + 1);
      }
      consolidatedData = rawTaskList;
      setLoading(false);
      setTaskData((prevDetails: any) => [...prevDetails, ...consolidatedData]);
      setFilteredTaskData((prevDetails: any) => [...prevDetails, ...consolidatedData]);
      //getTaskCounts(response.status_count);
      //setTaskData(consolidatedData);
      console.log(taskData);
    } else {
      setLoading(false);
    }
  };
  /////////getting countof paused and pending task function///////////
  const getTaskCounts = (statusCountList: any) => {
    const pendingCount = parseInt(statusCountList.find((s: any) => s.status_name === "Pending")?.service_status_count || "0");
    const onGoingCount = parseInt(statusCountList.find((s: any) => s.status_name === "On Going")?.service_status_count || "0");
    const completedCount = parseInt(statusCountList.find((s: any) => s.status_name === "Completed")?.service_status_count || "0");
    const expiredCount = parseInt(statusCountList.find((s: any) => s.status_name === "Expired")?.service_status_count || "0");
    const pausedCount = parseInt(statusCountList.find((s: any) => s.status_name === "Paused")?.service_status_count || "0");

    setPausedCount(pausedCount);
    setPendingOngoingCount(pendingCount + onGoingCount);
    setExpiredCount(expiredCount);
  };
  useEffect(() => {
    //getTaskCounts();
  }, [taskData]);

  const segmentChange = (status: any) => {
    setIsOpen(false);
    setFilterError(false);
    filterCriteria.service_status = status;
    setTaskData([]);
    setPage(0);
    setFilteredTaskData([]);
    getOtherTasks('',filterCriteria, 0);
  }

  useEffect(() => {
    //filterTasks(selectedSegment);
  }, [selectedSegment, taskData]);

  const filterTasks = (segment: any) => {
    setLoading(true);
    console.log("Filtering tasks for segment:", segment);
    if (segment === "pausedSegment") {

      const pausedTasks = taskData.filter(
        (task) => task.service_status.toLowerCase() === "paused"
      );
      console.log("Paused Tasks:", pausedTasks);
      setFilteredTaskData(pausedTasks);
      setLoading(false);
    } else if (segment === "pendingSegment") {
      const pendingTasks = taskData.filter(
        (task) =>
          task.service_status === "Pending" ||
          task.service_status === "On Going"
      );
      console.log("Pending and Ongoing Tasks:", pendingTasks);
      setFilteredTaskData(pendingTasks);
      setLoading(false);
    } else {
      const expiredTasks = taskData.filter(
        (task) => task.service_status.toLowerCase() === "expired"
      );
      console.log("Paused Tasks:", expiredTasks);
      setFilteredTaskData(expiredTasks);
      setLoading(false);
    }

  };

  const applyFilter = async () => {

    console.log("Filter Criteria:", filterCriteria);
    // Only apply filters if criteria and location are present
    if (filterCriteria && location.latitude && location.longitude) {
      // Fetch filtered task data
      setPage(0)
      setTaskData([]);
      setFilteredTaskData([]);
      await getOtherTasks('',filterCriteria, 0);
    }
  };

  const handleTaskClick = async (
    taskId: string,
    index: number,
    status: string
  ) => {
    if (status === "complete") {
      toast.success("Service Request is already complete.", {
        autoClose: 3000,
      });
      history.push("/tasks");
      return;
    }

    const ongoingTask = taskData.find(
      (task: any) =>
        task.service_status.toLowerCase() === "on going" && task.id !== taskId
    );

    if (ongoingTask) {
      toast.info(
        "Please complete or pause the ongoing task before starting or resuming another one.",
        { autoClose: 3000 }
      );
      history.push("/tasks");
      return;
    }

    try {
      const taskDetails = await retrieveNetworkTasksDetails(taskId);
      localStorage.setItem("activeTaskData", JSON.stringify(taskDetails));
      await Storage.set({ key: 'visit_id', value: taskId });

      history.push(`/tasks/${taskId}`);
    } catch (error) {
      console.error("Error fetching task details:", error);
      toast.error("Server not responding. Please try again later.");
    }
  };

  const handleInput = async (ev: CustomEvent) => {
    const query = (ev.target as HTMLIonSearchbarElement).value!.toLowerCase();
    setSearchQuery(query);
    if (query) {
      setPage(0)
      if (query.length >= 3) {
        setTaskData([]);
        setFilteredTaskData([]);
        await getOtherTasks(query,filterCriteria, 0);
      } else {
        setTaskData([]);
        setFilteredTaskData([]);
        await getOtherTasks('',filterCriteria, 0);
      }
      let filteredData = taskData.slice();
      console.log("Search Query:", query);
    } else {
      setPage(0)
      setTaskData([]);
      setFilteredTaskData([]);
      await getOtherTasks('',filterCriteria, 0);
    }
  };

  const handleFilterChange = (e: CustomEvent) => {
    // setSelectedPriority(e.detail.value)
    const target = e.target as HTMLIonInputElement | HTMLIonSelectElement;
    const { name, value } = target;
    console.log("Filter change - Name:", name, "Value:", value);
    setFilterCriteria((prev) => ({
      ...prev,
      [name]: value,
    }));
    setselectedFilterCriteria((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (value !== "") {
      setFilterError(false);
    }
    console.log('------------------------',filterCriteria);
  };

  ////////////////////////////////filter function///////////////////////////////

  const handleFilterSubmit = () => {
    if (filterCriteria.service_status !== "" || filterCriteria.service_date !== "") {
      setIsOpen(false);
      applyFilter();
      setFilterError(false);
    } else {
      if (
        filterCriteria.service_status === "" ||
        filterCriteria.service_date === ""
      ) {
        setFilterError(true);
      }
    }
  };

  const handleCancel = async () => {
    console.log("Filter Criteria:", filterCriteria);
    setIsOpen(false);
    setFilterError(false);
    setFilterApplied(false);
    setselectedFilterCriteria({
      service_date: "",
      service_status: '',
    });
    setFilterCriteria({
      service_date: "",
      service_status: '',
    });
    setPage(0)
    setTaskData([]);
    setFilteredTaskData([]);
    setTimeout(async () => {
      await getOtherTasks('', {
      service_date: "",
      service_status: '',
    },0);
    }, 500);

  };

  // Create a ref for the search input

  const handleSearchClick = () => {
    if (searchInputRef.current) {
      searchInputRef.current.setFocus(); // Use setFocus() for IonSearchbar
    }
  };

  const loadMoreTasks = async (event: CustomEvent<void>) => {

    await getOtherTasks(searchQuery,filterCriteria, page);
    (event.target as HTMLIonInfiniteScrollElement).complete();
  };
  return (
    <IonPage>
      <CommonHeader
        backToPath={"/dashboard"}
        pageTitle={"Other Tasks"}
        showIcons={true}
      />
      <IonContent
        fullscreen
        className="dashboardWrapp ionContentColor ion-padding-horizontal"
      >
        {loading && <IonProgressBar type="indeterminate" />}
        <div>
            <div>
              <IonItem
                lines="none"
                className="ion-item-inner ion-no-padding ion-margin-vertical"
              >
                <IonSearchbar
                  ref={searchInputRef}
                  debounce={500}
                  onIonInput={handleInput}
                ></IonSearchbar>
                <div className="ion-float_end">
                  <IonButton
                    shape="round"
                    onClick={() => setIsOpen(true)}
                    className="roundedWhiteBtIcon ion-no-margin"
                  >
                    <IonImg src="assets/images/filter-icon.svg"></IonImg>
                  </IonButton>
                </div>
              </IonItem>

              <IonList lines="none" className="ion-list-item">
                {!loading &&
                  filteredTaskData.length === 0 &&
                  (filterApplied ? (
                    <p style={{ textAlign: "center", width: "100%" }}>
                      No tasks found with the applied filter.
                    </p>
                  ) : (
                    pendingOngoingCount === 0 && (
                      <p style={{ textAlign: "center", width: "100%" }}>
                        There is no current task, use{" "}
                        <b onClick={() => setIsOpen(true)}>filter</b> (or){" "}
                        <b onClick={handleSearchClick}>Search</b> to get
                        previous Tasks
                      </p>
                    )
                  ))}

                {filteredTaskData.length > 0 &&
                  filteredTaskData.map((task: any, index: any) => (
                    <IonItem
                      key={task.id}
                      onClick={() =>
                        handleTaskClick(task.id, index, task.service_status)
                      }
                      lines="full"
                    >
                      <div className="task-container">
                        <OtherTaskComponent
                          id={task.id}
                          path={`/othertasks/${task.id}`}
                          title={task.task_name}
                          subTitle={task.treatment_name}
                          serviceDate={task.task_date}
                          date={`${formatDate(task.created_on)}  ${formatTime(
                            task.created_on
                          )}`}
                           status={task.status_name}
                          imgSrc="/assets/images/location-icon.svg"
                        />
                      </div>
                    </IonItem>
                  ))}
              </IonList>
            </div>
        </div>
        <IonInfiniteScroll
          threshold="100px"
          onIonInfinite={loadMoreTasks}
          disabled={!hasMoreTasks}
        >
          <IonInfiniteScrollContent
            loadingSpinner="bubbles"
            loadingText="Loading more Tasks..."
          ></IonInfiniteScrollContent>
        </IonInfiniteScroll>
      </IonContent>
      <IonModal className="ion-bottom-modal filterModal" isOpen={isOpen}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Filter</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <form>
            <div className="modalInputSandsale">
              <IonList className="formlist">
                <IonItem lines="none">
                  <div className="width100">
                    <IonLabel className="ion-label">Task Date</IonLabel>
                    <IonInput
                      name="service_date"
                      type="date"
                      value={filterselectedCriterias.service_date}
                      onIonChange={handleFilterChange}
                      aria-label="date"
                      fill="outline"
                      placeholder=""
                    />
                  </div>
                </IonItem>

                <IonItem lines="none">
                  <div className="width100">
                    <IonLabel className="ion-label">Status</IonLabel>
                    <IonSelect
                      value={filterselectedCriterias.service_status}
                      name="service_status"
                      onIonChange={handleFilterChange}
                      labelPlacement="floating"
                      placeholder="Select"
                      fill="outline"
                      aria-label=""
                    >
                      <IonSelectOption value="">Select Status</IonSelectOption>
                      <IonSelectOption value="OTHER_TASK_SCHEDULED">Scheduled</IonSelectOption>
                      <IonSelectOption value="OTHER_TASK_PENDING">Pending</IonSelectOption>
                      <IonSelectOption value="OTHER_TASK_ON_GOING">On Going</IonSelectOption>
                      <IonSelectOption value="OTHER_TASK_COMPLETED">Completed</IonSelectOption>
                    </IonSelect>
                  </div>
                </IonItem>
                {filterError ? (
                  <IonText style={{ color: "red" }}>
                    Please select Date (or) Status
                  </IonText>
                ) : (
                  ""
                )}
              </IonList>

              <IonButton
                color="primary"
                className="ion-button ion-margin-top"
                fill="solid"
                size="default"
                expand="block"
                onClick={handleFilterSubmit}
              >
                Search
              </IonButton>

              <IonButton
                className="ion-button ion-margin-vertical"
                color="medium"
                size="default"
                // onClick={() => setIsOpen(false)}
                onClick={handleCancel}
                fill="solid"
                expand="block"
              >
                Clear
              </IonButton>
            </div>
          </form>
        </IonContent>
      </IonModal>
      <ToastContainer autoClose={3000} />
      <GoTop />
    </IonPage>
  );
};

export default OtherTasks;
