import { API_BASE_URL } from "../../baseUrl";
import { getCurrentLocation } from "../../providers/GeoLocationProvider";
import { formatDateTime, getDateTime } from "../../../utils/dateTimeUtils";
// import useLongitudeLocation from "../../../components/useLongitudeLocation";
/////Get User Data from session Storage///////////

import { toZonedTime, format } from "date-fns-tz";

const formatToUaeTime = (dateTime: any) => {
  const uaeTimeZone = "Asia/Dubai";
  const zonedTime = toZonedTime(dateTime, uaeTimeZone);
  // return format(zonedTime, 'yyyy-MM-dd HH:mm:ss.SSS');
  return format(zonedTime, "yyyy-MM-dd HH:mm:ss");
};
export const getUserData = () => {
  const userDataString = localStorage.getItem("userData");
  if (!userDataString) {
    console.error("User data is not available");
    throw new Error("User Data Not available");
  }
  return JSON.parse(userDataString);
};
export const getActTaskData = () => {
  const userDataString = localStorage.getItem("activeTaskData");
  if (!userDataString) {
    console.error("Active Task data is not available");
    throw new Error("Active Task Data Not available");
  }
  return JSON.parse(userDataString);
};

// 14 - Pending, 17 - in-progress and 18 - complete
// 14 - Pending, 17 - in-progress and 18 - complete
export const fetchTaskData = async (
  status: string[],
  latitude: number,
  longitude: number,
  search: string,
  page: any
) => {
  // const location = useLongitudeLocation();
  console.log("statusArraywwwwwwwww", status);
  const userData = getUserData();
  try {
    const requestBody = {
      columns: [
        "tbl_visits.id",
        "tbl_services.service_name",
        "tbl_locations.address",
        "tbl_visits.status",
        "tbl_visits.created_on",
        "tbl_visits.service_date",
        "tbl_visits.expiry_date",
        "tbl_visits.preffered_time",
        "tbl_status.status_name as service_status",
        "tbl_visits.visit_type",
        "tbl_visits.reference_number",
        "tbl_visits.priority",
        "tbl_visits.service_id",
      ],
      order_by: {
        "tbl_visits.created_on": "asc",
        "tbl_visits.service_date": "asc",
      },
      filters: status,
      pagination: {
        limit: "10",
        page: page,
      },
      coordinates: {
        latitude,
        longitude,
      },
      search: search
    };

    const response = await fetch(`${API_BASE_URL}/v2/task-list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData?.api_token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    console.log(response);
    return await response.json();
  } catch (error) {
    console.error("Error fetching task data:", error);
    throw error;
  }
};
export const fetchOtherTaskData = async (
  filter : any,
  latitude: number,
  longitude: number,
  search: string,
  page: any
) => {
  const userData = getUserData();
  try {
    const requestBody = {
      columns: [
        "tbl_other_tasks.id",
        "tbl_other_tasks.task_name",
        "tbl_other_tasks.task_date",
        "tbl_services.service_name",
        "tbl_other_tasks.task_status",
        "tbl_status.status_name",
        "tbl_treatment_types.treatment_name",
        "tbl_other_tasks.created_on"
      ],
      "order_by": {
        "tbl_other_tasks.task_date": "desc"
      },
      "filters": {
        "tbl_other_tasks.task_status": filter.service_status,
	      "tbl_other_tasks.task_date": filter.service_date
      },
      "pagination": {
        "limit": "10",
        "page": page
      },
      search: search
    }

    const response = await fetch(`${API_BASE_URL}/v1/get-other-tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData?.api_token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    console.log(response);
    return await response.json();
  } catch (error) {
    console.error("Error fetching task data:", error);
    throw error;
  }
};
export const fetchFilteredTaskData = async (
  filterCriteria: string[],
  latitude: number,
  longitude: number
) => {
  // const location = useLongitudeLocation();
  const userData = getUserData();
  try {
    const requestBody = {
      columns: [
        "tbl_visits.id",
        "tbl_services.service_name",
        "tbl_locations.address",
        "tbl_visits.status",
        "tbl_visits.created_on",
        "tbl_visits.service_date",
        "tbl_visits.expiry_date",
        "tbl_visits.preffered_time",
        "tbl_status.status_name as service_status",
        "tbl_visits.visit_type",
        "tbl_visits.reference_number",
        "tbl_visits.priority",
        "tbl_visits.service_id",
      ],
      order_by: {
        "tbl_visits.created_on": "asc",
        "tbl_visits.service_date": "asc",
      },
      filters: filterCriteria,
      pagination: {
        limit: "0",
        page: "1",
      },
      coordinates: {
        latitude,
        longitude,
      },
    };

    const response = await fetch(`${API_BASE_URL}/v2/task-list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData?.api_token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    console.log(response);
    return await response.json();
  } catch (error) {
    console.error("Error fetching task data:", error);
    throw error;
  }
};

// To get Completed TaskList

export const completedTaskData = async (
  latitude: number,
  longitude: number
) => {
  // const location = useLongitudeLocation();
  const userData = getUserData();
  try {
    const requestBody = {
      columns: [
        "tbl_visits.id",
        "tbl_services.service_name",
        "tbl_locations.address",
        "tbl_visits.status",
        "tbl_visits.created_on",
        "tbl_visits.service_date",
        "tbl_visits.expiry_date",
        "tbl_visits.preffered_time",
        "tbl_status.status_name as service_status",
        "tbl_visits.visit_type",
        "tbl_visits.reference_number",
        "tbl_visits.priority",
        "tbl_visits.service_id",
      ],
      order_by: {
        // "tbl_visits.created_on": "asc",
        "tbl_visits.service_completed": "desc",
      },
      filters: {
        "tbl_visits.service_status": "ROUTINE_COMPLETED",
      },
      pagination: {
        limit: "0",
        page: "1",
      },
      coordinates: {
        latitude,
        longitude,
      },
    };

    const response = await fetch(`${API_BASE_URL}/v2/task-list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData?.api_token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    console.log(response);
    return await response.json();
  } catch (error) {
    console.error("Error fetching task data:", error);
    throw error;
  }
};

export const visitStatusCount = async () => {
  const userData = getUserData();
  try {
    const response = await fetch(`${API_BASE_URL}/v1/visit-status-count`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData?.api_token}`,
      },
    });
    if (response.ok) {
      return await response.json(); // Ensure response data is returned
    } else {
      console.error("Failed to fetch Visit Status Count:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Error in Visit status count:", error);
  }
};

//  "log_type": "Track Travel Time Start",//Service Request Start,Track Travel Time Start,Track Travel Time End
// "tracking_type":"Start",//Service Initiated,Start,Stop
export const taskInit = async (
  visit_id: string,
  formattedDate: string,
  log_type: string,
  tracking_type: string
) => {
  const userData = getUserData();
  const pos = await getCurrentLocation();
  if (!pos) {
    console.error("Error fetching Location");
    throw new Error("Failed to fetch Location");
  }
  try {
    const currentDate = new Date();
    const formattedDate = formatToUaeTime(currentDate); // Use the custom format
    const payload = [
      {
        visit_id: visit_id,
        log_type: log_type, //Service Request Start,Track Travel Time Start,Track Travel Time End
        tracking_type: tracking_type, //Service Initiated,Start,Stop
        date_time: formattedDate,
        latitude: "" + pos.coords.latitude,
        longitude: "" + pos.coords.longitude,
      },
    ];
    const response = await fetch(`${API_BASE_URL}/v1/task-initiate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData?.api_token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    console.log("Response in task Pest API layer :::", response);
    const data = await response.json();
    return { response, data };
  } catch (error) {
    console.error("Error fetching task data:", error);
    throw error;
  }
};

export const getTaskInitTimes = async (visitId: string) => {
  const userData = getUserData();
  try {
    const requestBody = {
      visit_id: visitId, //mandatory
    };

    const response = await fetch(`${API_BASE_URL}/v2/get-task-initiate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData?.api_token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("getTaskInitTimes; Failed to fetch data");
    }

    console.log(
      "getTaskInitTimes: Response in task Pest API latyer :::",
      response
    );
    const data = await response.json();
    console.log("getTaskInitTimes: response data", data);

    return { response, data };
  } catch (error) {
    console.error("getTaskInitTimes: Error fetching task data:", error);
    throw error;
  }
};

export async function fetchTaskDetails(id: string): Promise<any> {
  const userData = getUserData();

  try {
    const payload = {
      columns: [
        "tbl_visits.id",
        "tbl_services.service_name",
        "tbl_locations.address",
        "tbl_visits.status",
        "tbl_visits.created_on",
        "tbl_visits.service_date",
        "tbl_visits.expiry_date",
        "tbl_visits.preffered_time",
        "tbl_status.status_name as service_status",
        "tbl_visits.visit_type",
        "tbl_visits.reference_number",
        "tbl_customers.customer_name",
        "tbl_customers.mobile_no",
        "tbl_visits.service_id",
      ],
      order_by: {
        "tbl_visits.created_on": "asc",
      },
      filters: {
        // "tbl_visits.service_status": "14",
        "tbl_visits.id": id,
      },
      pagination: {
        limit: "1",
        page: "0",
      },
    };

    const response = await fetch(`${API_BASE_URL}/v2/task-detail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData?.api_token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch task details");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching task details:", error);
    throw error;
  }
}

export async function fetchOtherTaskDetails(id: string): Promise<any> {
  const userData = getUserData();

  try {
    const payload = {
      columns: [
        "tbl_other_tasks.id",
        "tbl_other_tasks.task_name",
        "tbl_other_tasks.comments",
        "tbl_other_tasks.task_status",
         "tbl_status.status_name",
        "tbl_other_tasks.created_on",
        "tbl_services.service_name",
        "tbl_treatment_types.treatment_name",
        "tbl_other_tasks.scheduled_time",
        "tbl_other_tasks.start_time",
        "tbl_other_tasks.end_time"
      ],
      order_by: {
        "tbl_other_tasks.created_on": "asc"
      },
      filters: {
        "tbl_other_tasks.id":id
      },
      pagination: {
        limit: "1",
        page: "0",
      },
    };

    const response = await fetch(`${API_BASE_URL}/v1/get-other-tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData?.api_token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch task details");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching task details:", error);
    throw error;
  }
}
//////////////////////////////////////////////////////////////////////////////////

export const followup = async () => {
  const userDataString = localStorage.getItem("userData");
  if (!userDataString) {
    console.error("data is not available ");
    return;
  }
  const userData = JSON.parse(userDataString);

  try {
    const payload = {
      columns: [
        "tbl_visits.id",
        "tbl_services.service_name",
        "tbl_locations.address",
        "tbl_visits.status",
        "tbl_visits.created_on",
        "tbl_visits.service_date",
        "tbl_visits.expiry_date",
        "tbl_visits.preffered_time",
        "tbl_visits.visit_type",
        "tbl_visits.service_id",
        "tbl_visit_feedback_follow_up.is_follow_up_required",
        "tbl_visit_feedback_follow_up.next_follow_up",
      ],
      order_by: {
        "tbl_visits.id": "desc",
      },
      filters: { "tbl_visit_feedback_follow_up.is_follow_up_required": "Yes" },
      pagination: {
        limit: "50",
        page: "1",
      },
    };
    const response = await fetch(`${API_BASE_URL}/v1/follow-up-reschedule`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData?.api_token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch task details");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching task details:", error);
    throw error;
  }
};

//////////////////////////////////////////////////////////////////////////////////////////////////////

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    // hour: "numeric",
    // minute: "numeric",
    // hourCycle: "h24",
    // second: "numeric",
    hour12: false, // Ensure 12-hour format
  };
  return date.toLocaleString("en-US", options);
};

// pestSubmission.ts
//////////////////////////pestActivityFound Api////////////////////////////////////////////////

export const fetchPestData = async () => {
  const userData = getUserData();
  const actTaskData = getActTaskData()[0].service_id;
  console.log("active task data", actTaskData);
  try {
    const requestBody = {
      columns: ["id", "sub_service_id", "pest_report_type"],
      order_by: {
        created_on: "asc",
      },
      filters: { sub_service_id: actTaskData },
      pagination: {
        limit: "0",
        page: "1",
      },
    };

    const response = await fetch(`${API_BASE_URL}/v1/get-pests-list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData?.api_token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    console.log("Response in task Pest API latyer :::", response);
    const data = await response.json();
    console.log("qwertyuio", data);
    return { response, data };
  } catch (error) {
    console.error("Error fetching task data:", error);
    throw error;
  }
};

export async function postPestActivity(
  formDataArray: any[],
  // pestOptions: any[],
  latitude: number,
  longitude: number,
  visit_id: any
): Promise<any> {
  // const Location = useLongitudeLocation();
  const userData = getUserData();

  //Fetch Active Task ID
  const activeTaskStr = localStorage.getItem("activeTaskData");
  if (!activeTaskStr) {
    throw new Error("Task Data not available");
  }
  const activeTaskData = JSON.parse(activeTaskStr);
  // const visit_id = activeTaskData[0].id;
  console.log("visit id from session strorage ", visit_id);
  try {
    // Construct the pest_found_details array
    const pest_found_details = formDataArray.map((item) => ({
      is_pest_found: item.is_pest_found === "Yes" ? "Yes" : "No",
      sub_service_id: item.sub_service_id || "",
      pest_severity: item.pest_severity,
      pest_area: item.pest_area,
      pest_reported_id: item.pest_report_id, // Use the pest_report_id from formDataArray
      pest_photo: item.pest_photo,
    }));

    // Construct the requestBody object
    const payload = [
      {
        pest_found_details: pest_found_details,
        latitude,
        longitude,
        visit_id: visit_id,
      },
    ];
    console.log("Payload in pest activity found", payload);
    const response = await fetch(`${API_BASE_URL}/v1/add-pest-found-details`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData?.api_token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // throw new Error("Failed to submit pest details");
      return { error: true, message: "Transaction Failed" };
    }

    const data = await response.json();
    return { response, data };
  } catch (error) {
    console.error("Error in posting pest activity details:", error);
    // throw error;
    return { error: true, message: "Transaction Failed" };
  }
}
/////////////////////////////////////chemicals Api///////////////////////////////
// export const fetchGetPestChemicalItems = async () => {
//   const userData = getUserData();
//   try {
//     const requestBody = {
//       service_id: "4",
//     };

//     const response = await fetch(`${API_BASE_URL}/v1/get-items`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${userData?.api_token}`,
//       },
//       body: JSON.stringify(requestBody),
//     });

//     if (!response.ok) {
//       throw new Error("Failed to fetch data");
//     }

//     const data = await response.json();
//     return { response, data };
//   } catch (error) {
//     console.error("Error fetching task data:", error);
//     throw error;
//   }
// };
export const fetchGetPestChemicalItems = async () => {
  const taskDataStr = localStorage.getItem("activeTaskData");
  if (!taskDataStr) {
    throw new Error("Task Data is not available");
  }
  const activeTaskData = JSON.parse(taskDataStr);

  const service_id = activeTaskData.service_id;
  // const location = useLongitudeLocation();
  const userData = getUserData();
  try {
    const requestBody = {
      columns: [
        "tbl_item_service_mapping.id",
        "tbl_item_service_mapping.item_id",
        "tbl_items.item_name",
        "tbl_item_service_mapping.unit_id",
        "tbl_uoms.name",
      ],
      order_by: {
        "tbl_items.item_name": "asc",
      },
      filters: {
        "tbl_item_service_mapping.service_id": service_id,
      },
      pagination: {
        limit: "0",
        page: "1",
      },
    };
    const response = await fetch(
      `${API_BASE_URL}/v2/get-chemicals-used-for-pest
`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData?.api_token}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    console.log(response);
    return await response.json();
  } catch (error) {
    console.error("Error fetching task data:", error);
    throw error;
  }
};

export const insertChemicalsUsedForPest = async (payload: any) => {
  try {
    const userData = getUserData();
    const response = await fetch(
      `${API_BASE_URL}/v1/insert-chemicals-used-for-pest`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData.api_token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    if (data.success) {
      return data;
    } else {
      throw new Error(data.message || "Failed to insert records");
    }
  } catch (error) {
    console.error("Error during submission", error);
    throw error;
  }
};
////////////////////////////getvistexecution API///////////////////////////////////////////
export const getVisitExecutionDetails = async (visitId: string) => {
  const userData = getUserData();
  try {
    const requestBody = {
      visit_id: visitId,
    };

    const response = await fetch(
      `${API_BASE_URL}/v1/get-visit-execution-details-v2
`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData?.api_token}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch visit execution details");
    }

    const data = await response.json();
    console.log("getVisitExecutionDetails: Parsed response data:", data);

    return { response, data };
  } catch (error) {
    console.error(
      "getVisitExecutionDetails: Error fetching visit execution details:",
      error
    );
    throw error;
  }
};

export const createCallOut = async (payloadObj: any) => {
  console.log(payloadObj);
  const userDataString = localStorage.getItem("userData");
  if (!userDataString) {
    console.error("User data is not available");
    throw new Error("User Data Not available");
  }
  const userData = JSON.parse(userDataString);
  const payload = payloadObj;
  try {
    const response = await fetch(
      `${API_BASE_URL}/v1/create-callout
`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData?.api_token}`,
        },
        body: JSON.stringify(payload),
      }
    );
    if (response.ok) {
      return await response.json(); // Ensure response data is returned
    } else {
      console.error("Failed to fetch Visit Status Count:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Error in Visit status count:", error);
  }
};

export const createTask = async (payloadObj: any) => {
  console.log(payloadObj);
  const userDataString = localStorage.getItem("userData");
  if (!userDataString) {
    console.error("User data is not available");
    throw new Error("User Data Not available");
  }
  const userData = JSON.parse(userDataString);
  const payload = payloadObj;
  try {
    const response = await fetch(
      `${API_BASE_URL}/v1/create-my-task
`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData?.api_token}`,
        },
        body: JSON.stringify(payload),
      }
    );
    if (response.ok) {
      return await response.json(); // Ensure response data is returned
    } else {
      console.error("Failed to fetch Visit Status Count:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Error in Visit status count:", error);
  }
};
export const createOtherTask = async (payloadObj: any) => {
  console.log(payloadObj);
  const userDataString = localStorage.getItem("userData");
  if (!userDataString) {
    console.error("User data is not available");
    throw new Error("User Data Not available");
  }
  const userData = JSON.parse(userDataString);
  const payload = payloadObj;
  try {
    const response = await fetch(
      `${API_BASE_URL}/v1/create-other-task
`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData?.api_token}`,
        },
        body: JSON.stringify(payload),
      }
    );
    if (response.ok) {
      return await response.json(); // Ensure response data is returned
    } else {
      console.error("Failed to fetch Visit Status Count:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Error in Visit status count:", error);
  }
};
export const treatmentTypes = async (serviceId: any) => {
  const userData = getUserData();
  try {
    const requestBody = {
      service_id: serviceId,
    };

    const response = await fetch(`${API_BASE_URL}/v1/get-treatment-types`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData?.api_token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch treatment types");
    }

    const data = await response.json();
    console.log("getTreatmentTypes: Parsed response data:", data);

    return { response, data };
  } catch (error) {
    console.error("getTreatmentTypes: Error fetching treatment types:", error);
    throw error;
  }
};

export const pestReported = async (serviceId: any) => {
  const userData = getUserData();
  try {
    const requestBody = {
      service_id: serviceId,
    };

    const response = await fetch(`${API_BASE_URL}/v1/get-pests-reported`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData?.api_token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch reported pests");
    }

    const data = await response.json();
    console.log("pestReported: Parsed response data:", data);

    return { response, data };
  } catch (error) {
    console.error("getTreatmentTypes: Error fetching reported pests:", error);
    throw error;
  }
};

export const customerList = async () => {
  const userData = getUserData();
  try {
    const response = await fetch(`${API_BASE_URL}/v1/get-customers`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData?.api_token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch customer lists");
    }

    const data = await response.json();
    console.log("customer list: Parsed response data:", data);

    return { response, data };
  } catch (error) {
    console.error("getTreatmentTypes: Error fetching customer list:", error);
    throw error;
  }
};

export const customerLocations = async (customerId: any) => {
  const userData = getUserData();
  try {
    const requestBody = {
      customer: customerId,
    };
    const response = await fetch(`${API_BASE_URL}/v1/get-customer-location`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData?.api_token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch customer locations");
    }

    const data = await response.json();
    console.log("customer list: Parsed response data:", data);

    return { response, data };
  } catch (error) {
    console.error(
      "getTreatmentTypes: Error fetching customer locations:",
      error
    );
    throw error;
  }
};

export const customerServices = async (customerId: any) => {
  const userData = getUserData();
  try {
    const requestBody = {
      customer_id: customerId,
    };
    const response = await fetch(`${API_BASE_URL}/v1/get-services-by-customer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData?.api_token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch customer locations");
    }

    const data = await response.json();
    console.log("customer list: Parsed response data:", data);
    return { response, data };
  } catch (error) {
    console.error(
      "getTreatmentTypes: Error fetching customer locations:",
      error
    );
    throw error;
  }
};

export const serviceList = async () => {
  const userData = getUserData();
  try {
    const response = await fetch(`${API_BASE_URL}/v1/get-services`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData?.api_token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch service lists");
    }

    const data = await response.json();
    console.log("service list: Parsed response data:", data);

    return { response, data };
  } catch (error) {
    console.error(" Error fetching service list:", error);
    throw error;
  }
};

export const timeDuration = async () => {
  const userData = getUserData();
  try {
    const response = await fetch(`${API_BASE_URL}/v1/time-duration`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData?.api_token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch duration data");
    }

    const data = await response.json();
    console.log("Duration data: Parsed response data:", data);

    return { response, data };
  } catch (error) {
    console.error("Error fetching duration data:", error);
    throw error;
  }
};

export const customerType = async () => {
  const userData = getUserData();
  try {
    const response = await fetch(`${API_BASE_URL}/v1/get-clienttypes`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData?.api_token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch customer types");
    }

    const data = await response.json();
    console.log("customer type: Parsed response data:", data);

    return { response, data };
  } catch (error) {
    console.error(" Error fetching custoemr types:", error);
    throw error;
  }
};

export const getAreas = async () => {
  const userData = getUserData();
  try {
    const response = await fetch(`${API_BASE_URL}/v1/get-areas`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData?.api_token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch areas");
    }

    const data = await response.json();
    console.log("areas: Parsed response data:", data);

    return { response, data };
  } catch (error) {
    console.error(" Error fetching areas:", error);
    throw error;
  }
};

export const addCustomer = async (body: any) => {
  const userData = getUserData();
  try {
    const response = await fetch(`${API_BASE_URL}/v1/add-customer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData?.api_token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("Failed to add customer");
    }

    const data = await response.json();
    console.log("pestReported: Parsed response data:", data);

    return { response, data };
  } catch (error) {
    console.error("getTreatmentTypes: Error creating a new customer:", error);
    throw error;
  }
};
///////////////////////recommendations Apis//////////////////////////////////

export const multiRecommendations = async () => {
  const userData = getUserData();
  try {
    const response = await fetch(
      `${API_BASE_URL}/v1/get-recommendations-list
`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData?.api_token}`,
        },
      }
    );
    if (response.ok) {
      return await response.json(); // Ensure response data is returned
    } else {
      console.error("Failed to fetch Visit Status Count:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Error in Visit status count:", error);
  }
};

export const submitRecommendations = async (requestBody: any) => {
  try {
    const userData = getUserData();
    const response = await fetch(`${API_BASE_URL}/v1/add-pest-recommendation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData?.api_token}`,
      },
      body: JSON.stringify(requestBody),
    });

    const responseData = await response.json();
    // if (!response.ok) {
    //   throw new Error(
    //     `Failed to submit work done detail: ${response.statusText}`
    //   );
    // }
    return responseData;
  } catch (error) {
    console.error("Error in submitWorkDoneDetail:", error);
    throw error;
  }
};

////////////////////////////////workdoneDetails Apis///////////////////////////

export const fetchQuestionnaire = async () => {
  const taskDataStr = localStorage.getItem("activeTaskData");
  if (!taskDataStr) {
    throw new Error("Task data is not available");
  }
  const activeTaskData = JSON.parse(taskDataStr);
  const service_id = activeTaskData.service_id;
  try {
    const userData = getUserData();
    const response = await fetch(
      `${API_BASE_URL}/v1/get-work-done-questionnaire`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData.api_token}`,
        },
        body: JSON.stringify({ service_id: service_id }),
      }
    );

    if (response.ok) {
      const { data } = await response.json();
      return { response, data };
    } else {
      throw new Error("Failed to fetch questionnaire");
    }
  } catch (error: any) {
    console.error("cannot fetch workdone Questionarrie:", error);
    throw error;
  }
};

export const submitWorkDoneDetail = async (requestBody: any) => {
  try {
    const userData = getUserData();
    const response = await fetch(`${API_BASE_URL}/v1/add-work-done-detail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData.api_token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      const responseData = await response.json();
      return responseData;
    } else {
      throw new Error("Failed to submit work done detail");
    }
  } catch (error) {
    console.error("Error submitting form:", error);
  }
};

////////////////////////////////////////feedback followup apis/////////////////////////////////////////
export const submitFollowupFeedback = async (requestBody: any) => {
  try {
    const userData = getUserData();
    const response = await fetch(
      `${API_BASE_URL}/v1/add-followup-feedback-details`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData.api_token}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (response.ok) {
      const responseData = await response.json();
      return responseData;
    } else {
      throw new Error("Failed to submit feedback");
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    throw error;
  }
};
export const fetchvisitExecutionpreview = async (requestBody: any) => {
  try {
    const userData = getUserData();
    const response = await fetch(
      `${API_BASE_URL}/v1/get-visit-execution-details-v2`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData.api_token}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (response.ok) {
      const responseData = await response.json();
      return responseData;
    } else {
      throw new Error("Failed to get the visit execution details");
    }
  } catch (error) {
    console.error("Error in getting the visitexecution details:", error);
  }
};
/////////////////////////formData API call///////////////////////////////////
export const getvistexecutionApi = async (requestBody: any) => {
  try {
    const userData = getUserData();
    const response = await fetch(
      `${API_BASE_URL}/v1/get-visit-execution-details-v2`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData.api_token}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (response.ok) {
      const responseData = await response.json();
      return responseData;
    } else {
      throw new Error("Failed to submit formData");
    }
  } catch (error) {
    console.error("Error submitting form:", error);
  }
};
//////////////////////////getvisittraveldetails API-Siteview location//////////////////////////////export const getvistexecutionApi = async (requestBody: any) => {
export const getvisittraveldetails = async (requestBody: any) => {
  try {
    const userData = getUserData();
    const response = await fetch(`${API_BASE_URL}/v1/get-visit-travel-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData.api_token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      const responseData = await response.json();
      return responseData;
    } else {
      throw new Error("Failed to get the get visit travel details");
    }
  } catch (error) {
    console.error("Error in getting visit travel details:", error);
  }
};


/////////////////////////Request Material////////////////////////////////////////////
export const requestMaterials = async (materialData: any) => {
  const userData = getUserData();
  try {
    const response = await fetch(`${API_BASE_URL}/v1/request-stock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData?.api_token}`,
      },
      body: JSON.stringify(materialData),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch treatment types");
    }

    const data = await response.json();
    console.log("getTreatmentTypes: Parsed response data:", data);

    return { response, data };
  } catch (error) {
    console.error("getTreatmentTypes: Error fetching treatment types:", error);
    throw error;
  }
};

/////////////////////////Request Material////////////////////////////////////////////
export const checkOngoingTask = async () => {
  const userData = getUserData();
  try {
    const response = await fetch(`${API_BASE_URL}/v1/check-is-user-on-job`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData?.api_token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch treatment types");
    }

    const data = await response.json();
    console.log("getTreatmentTypes: Parsed response data:", data);

    return data;
  } catch (error) {
    console.error("getTreatmentTypes: Error fetching treatment types:", error);
    throw error;
  }
};


/////////////////////////Request Material////////////////////////////////////////////
export const updateOtherTask = async (payload: any) => {
  const userData = getUserData();
  try {
    const response = await fetch(`${API_BASE_URL}/v1/update-other-task`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData?.api_token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch treatment types");
    }

    const data = await response.json();
    console.log("getTreatmentTypes: Parsed response data:", data);

    return { response, data };
  } catch (error) {
    console.error("getTreatmentTypes: Error fetching treatment types:", error);
    throw error;
  }
};
////////////////////////Reschedule Api///////////////////////////////////////////////

// export const taskRescheduleData = async (requestBody: any) => {
//   try {
//     const userData = getUserData();
//     const response = await fetch(`${API_BASE_URL}/v1/reschedule-visit`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${userData.api_token}`,
//       },
//       body: requestBody,
//     });

//     if (response.ok) {
//       const responseData = await response.json();
//       return responseData;
//     } else {
//       throw new Error("Failed   to get reshedule details");
//     }
//   } catch (error) {
//     console.error("Error submitting reshedule data:", error);
//   }
// };
