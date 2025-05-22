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


const Tasks: React.FC = () => {
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
    priority: "",
    service_status: "ROUTINE_ON_GOING | ROUTINE_PENDING",
  });
  console.log("default date string = ", getJustDate());
  const [filterselectedCriterias, setselectedFilterCriteria] = useState({
    service_date: "",
    priority: "",
    service_status: "ROUTINE_ON_GOING | ROUTINE_PENDING",
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
      getOnGoingNPendingTasks('', filterCriteria);
      effectRan.current = true;
    }
  }, []);

  useEffect(() => {
    //getOnGoingNPendingTasks('', selectedStatus);
  }, [selectedSegment]);

  const getOnGoingNPendingTasks = async (searchText: any, status: any) => {

    let geolocation: any = await getCurrentLocation();

    const mapToObject = (map: Map<string, any>) =>
      Object.fromEntries(map.entries());
    const filterMap = new Map<string, any>();
    // Apply individual filter conditions
    if (filterCriteria.priority !== "") {
      filterMap.set("tbl_visits.priority", filterCriteria.priority);
    }
    if (filterCriteria.service_date !== "") {
      filterMap.set("tbl_visits.service_date", filterCriteria.service_date);
    }
    // Always include service_status filter
    filterMap.set("tbl_visits.service_status", filterCriteria.service_status);
    const convFilterCriteria = mapToObject(filterMap);

    setLoading(true);
    if (geolocation.coords.latitude && geolocation.coords.longitude) {
      let consolidatedData: Array<any> = [];
      setLoading(true);
      console.log("Fetching Task List from Tasks");
      // Fetch tasks with statuses 14 (pending), 17 (on-going), 33 (new status)
      let response = await retrieveNetworkTasks(
        convFilterCriteria,
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

      // Sort the data: Pending tasks should come first, and within each status, sort by created date descending
      let sortedData = rawTaskList.sort((a: any, b: any) => {
        // Sort by service_status first (pending first, ongoing and others later)
        // if (a.service_status === "Pending" && b.service_status !== "Pending") {
        //   return -1;
        // }
        // if (a.service_status !== "Pending" && b.service_status === "Pending") {
        //   return 1;
        // }

        // If statuses are the same, sort by created date descending
        return (
          new Date(b.created_on).getTime() - new Date(a.created_on).getTime()
        );
      });
      sortedData = rawTaskList.sort((a: any, b: any) => {
        // Sort by service_status first (pending first, ongoing and others later)
        if (
          a.service_status === "On Going" &&
          b.service_status !== "On Going"
        ) {
          return -1;
        }
        if (
          a.service_status !== "On Going" &&
          b.service_status === "On Going"
        ) {
          return 1;
        }

        // If statuses are the same, sort by created date descending
        return (
          new Date(b.created_on).getTime() - new Date(a.created_on).getTime()
        );
      });

      consolidatedData = sortedData;
      setLoading(false);
      setTaskData((prevDetails: any) => [...prevDetails, ...consolidatedData]);
      setFilteredTaskData((prevDetails: any) => [...prevDetails, ...consolidatedData]);
      getTaskCounts(response.status_count);
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
    filterCriteria.service_status = status;
    setTaskData([]);
    setFilteredTaskData([]);
    getOnGoingNPendingTasks('', filterCriteria);
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
      await getOnGoingNPendingTasks('', filterCriteria);
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
        await getOnGoingNPendingTasks(query, selectedStatus);
      } else {
        setTaskData([]);
        setFilteredTaskData([]);
        await getOnGoingNPendingTasks('', selectedStatus);
      }
      let filteredData = taskData.slice();
      console.log("Search Query:", query);
    } else {
      setPage(0)
      setTaskData([]);
      setFilteredTaskData([]);
      await getOnGoingNPendingTasks('', selectedStatus);
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
  };

  ////////////////////////////////filter function///////////////////////////////

  const handleFilterSubmit = () => {
    if (filterCriteria.priority !== "" || filterCriteria.service_date !== "") {
      setIsOpen(false);
      applyFilter();
      setFilterError(false);
    } else {
      if (
        filterCriteria.priority === "" ||
        filterCriteria.service_date === ""
      ) {
        setFilterError(true);
      }
    }
  };

  const handleCancel = async () => {
    setIsOpen(false);
    setFilterError(false);
    setFilterApplied(false);
    setselectedFilterCriteria({
      service_date: "",
      priority: "",
      service_status: selectedStatus,
    });
    setFilterCriteria({
      service_date: "",
      priority: "",
      service_status: selectedStatus,
    });
    setPage(0)
    setTaskData([]);
    setFilteredTaskData([]);
    await getOnGoingNPendingTasks('', {
      service_date: "",
      priority: "",
      service_status: selectedStatus,
    });
  };

  // Create a ref for the search input

  const handleSearchClick = () => {
    if (searchInputRef.current) {
      searchInputRef.current.setFocus(); // Use setFocus() for IonSearchbar
    }
  };

  const loadMoreTasks = async (event: CustomEvent<void>) => {

    await getOnGoingNPendingTasks(searchQuery, selectedStatus);
    (event.target as HTMLIonInfiniteScrollElement).complete();
  };
  return (
    <IonPage>
      <CommonHeader
        backToPath={"/dashboard"}
        pageTitle={"Tasks"}
        showIcons={true}
      />
      <IonContent
        fullscreen
        className="dashboardWrapp ionContentColor ion-padding-horizontal"
      >
        {loading && <IonProgressBar type="indeterminate" />}
        <IonSegment
          className="stockIonSegmentButton"
          value={selectedSegment}
          onIonChange={(e) => {
            const value = e.detail.value as string;
            setSelectedSegment(value);

            if (value === 'pendingSegment') {
              setSelectedStatus("ROUTINE_ON_GOING | ROUTINE_PENDING");
              segmentChange("ROUTINE_ON_GOING | ROUTINE_PENDING");

            }
            if (value === 'pausedSegment') {
              setSelectedStatus("ROUTINE_PAUSED");
              segmentChange("ROUTINE_PAUSED");
            }
            if (value === 'expiredSegment') {
              setSelectedStatus("ROUTINE_EXPIRED");
              segmentChange("ROUTINE_EXPIRED");
            }
          }}
        >
          <IonSegmentButton value="pendingSegment">
            <IonLabel>
              Pending{" "}
              <IonBadge slot="start">
                {" "}
                {pendingOngoingCount}
              </IonBadge>
            </IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="pausedSegment">
            <IonLabel>
              Paused{" "}
              <IonBadge slot="start">
                {pausedCount}
              </IonBadge>
            </IonLabel>
          </IonSegmentButton>

          <IonSegmentButton value="expiredSegment">
            <IonLabel>
              Expired{" "}
              <IonBadge slot="start">
                {" "}
                {expiredCount}
              </IonBadge>
            </IonLabel>
          </IonSegmentButton>
        </IonSegment>
        <div>
          {selectedSegment === "pendingSegment" && (
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
                        <TaskComponent
                          id={task.id}
                          path={`/tasks/${task.id}`}
                          title={task.service_name}
                          subTitle={task.address}
                          serviceDate={task.service_date}
                          date={`${formatDate(task.created_on)}  ${formatTime(
                            task.created_on
                          )}`}
                          time={task.preffered_time}
                          reference_Number={task.reference_number}
                          priority={task.priority}
                          distance={task.distance}
                          status={task.service_status}
                          imgSrc="/assets/images/location-icon.svg"
                        />
                      </div>
                    </IonItem>
                  ))}
              </IonList>
            </div>
          )}
          {selectedSegment === "pausedSegment" && (
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
                {!loading && filteredTaskData.length === 0 && (
                  <p style={{ textAlign: "center", width: "100%" }}>
                    No tasks assigned/found.
                  </p>
                )}
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
                        <TaskComponent
                          id={task.id}
                          path={`/tasks/${task.id}`}
                          title={task.service_name}
                          subTitle={task.address}
                          serviceDate={task.service_date}
                          date={`${formatDate(task.created_on)}  ${formatTime(
                            task.created_on
                          )}`}
                          time={task.preffered_time}
                          reference_Number={task.reference_number}
                          priority={task.priority}
                          distance={task.distance}
                          status={task.service_status}
                          imgSrc="/assets/images/location-icon.svg"
                        />
                      </div>
                    </IonItem>
                  ))}
              </IonList>
            </div>
          )}
          {selectedSegment === "expiredSegment" && (
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
                {!loading && filteredTaskData.length === 0 && (
                  <p style={{ textAlign: "center", width: "100%" }}>
                    No tasks assigned/found.
                  </p>
                )}
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
                        <TaskComponent
                          id={task.id}
                          path={`/tasks/${task.id}`}
                          title={task.service_name}
                          subTitle={task.address}
                          serviceDate={task.service_date}
                          date={`${formatDate(task.created_on)}  ${formatTime(
                            task.created_on
                          )}`}
                          time={task.preffered_time}
                          reference_Number={task.reference_number}
                          priority={task.priority}
                          distance={task.distance}
                          status={task.service_status}
                          imgSrc="/assets/images/location-icon.svg"
                        />
                      </div>
                    </IonItem>
                  ))}
              </IonList>
            </div>
          )}
        </div>
        <IonInfiniteScroll
          threshold="100px"
          onIonInfinite={loadMoreTasks}
          disabled={!hasMoreTasks}
        >
          <IonInfiniteScrollContent
            loadingSpinner="bubbles"
            loadingText="Loading more materials..."
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
                    <IonLabel className="ion-label">Service Date</IonLabel>
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
                    <IonLabel className="ion-label">Priority</IonLabel>
                    <IonSelect
                      value={filterselectedCriterias.priority}
                      name="priority"
                      onIonChange={handleFilterChange}
                      labelPlacement="floating"
                      placeholder="Select"
                      fill="outline"
                      aria-label=""
                    >
                      <IonSelectOption value="High">High</IonSelectOption>
                      <IonSelectOption value="Medium">Medium</IonSelectOption>
                      <IonSelectOption value="Low">Low</IonSelectOption>
                    </IonSelect>
                  </div>
                </IonItem>
                {filterError ? (
                  <IonText style={{ color: "red" }}>
                    Please select Date (or) Priority
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

export default Tasks;
