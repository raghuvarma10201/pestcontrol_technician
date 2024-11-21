import React, { useEffect, useState, useRef } from "react";

import {
    IonButton,
    IonContent,
    IonFooter,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonInput,
    IonToolbar,
    IonImg,
    IonHeader,
    IonBackButton,
    IonButtons,
    IonTitle,
    IonText,
    IonDatetime,
    IonModal,
    IonAlert,
    IonList,
    IonRadioGroup,
    IonRadio,
    IonSearchbar,
    IonCheckbox,
} from "@ionic/react";
import { useHistory } from "react-router";
import * as Yup from "yup";
import { Formik, Form, Field, ErrorMessage, useFormikContext, FormikHelpers } from "formik";
import {

    customerList,
    createTask,
    customerServices,
    timeDuration,
    createCallOut,
} from "../data/apidata/taskApi/taskDataApi";
import { toast, ToastContainer } from "react-toastify";
import "./CreateTask.css";

import CustomerTypeahead from "../components/Typeahead"
import { useLoadScript } from "@react-google-maps/api";
import FullScreenLoader from "../components/FullScreenLoader";

const CreateCallOut: React.FC = () => {
    const history = useHistory();
    const [loading, setLoading] = useState<boolean>(true);
    const today = new Date().toISOString().split("T")[0];
    const [customerData, setCustomerData] = useState<any[]>([]);
    const [customerServiceData, setCustomerServiceData] = useState<any[]>([]);
    const [treatmentData, setTreatmentData] = useState<any[]>([]);
    const [durationData, setDurationData] = useState<any[]>([]);
    const [selectedService, setSelectedService] = useState<any[]>([]);
    const [selectedValue, setSelectedValue] = useState<string | undefined>();


    const [formData, setFormData] = useState({
        customerId: '',
        visit_config_id: null,
        service_id: "",
        service_date: today,
        preferred_time: "",
        service_duration: "",
        selectedTreatments: {} as { [key: string]: string },
        callouts_completed: null,
    });

    const validationSchema = Yup.object().shape({
        customerId: Yup.string().required("Please select customer."),
        visit_config_id: Yup.string().required("Task name is required."),
        service_id: Yup.string().required("Please select the service."),
        service_date: Yup.string().required("Task date is required."),
        preferred_time: Yup.string().required("Preferred time is required."),
        service_duration: Yup.string().required("Please select the duration."),
        callouts_completed: Yup.string().required("")
    });

    // const [formData, setFormData] = useState<{ customerId: string }>({ customerId: '' });
    const [selectedCustomerName, setSelectedCustomerName] = useState<string>(
        "Select Customer"
    );

    const modal = useRef<HTMLIonModalElement>(null);

    const customerSelectionChanged = (customerId: string) => {
        const customer = customerData.find((cust) => cust.value === customerId);
        setFormData((prevData) => ({
            ...prevData,
            customerId,
        }));
        setSelectedCustomerName(customer ? customer.text : "Select Customer");
        //setFormData((prev) => ({ ...prev, customerId: customerId }));
        getCustomerServices(customerId); // Fetch customer locations when a customer is selected
        modal.current?.dismiss();
    };
    const getCustomerList = async () => {
        setLoading(true);
        customerList()
            .then((response) => {
                if (response && response.data.success) {
                    const customerDetails = response.data.data.map((customer: any) => ({
                        text: customer.customer_name,
                        value: customer.id,
                    }));
                    
                    setCustomerData(customerDetails);
                } else {
                    console.error("Failed to fetch customer data. Error:", response);
                    toast.error("Server not responding. Please try again later.");
                }
            })
            .catch((error) => {
                console.error("Error fetching customer data:", error);
                toast.error("Server not responding. Please try again later.");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const getCustomerServices = async (customerId: any) => {
        setLoading(true);
        customerServices(customerId)
            .then((response) => {
                if (response && response.data.success) {
                    if (response.data.data.length > 0) {
                        const customerServiceDetails = response.data.data;
                        console.log(customerServiceDetails);
                        setCustomerServiceData(customerServiceDetails);
                        setFormData({
                            customerId: customerId,
                            visit_config_id: null,
                            service_id: "",
                            service_date: today,
                            preferred_time: "",
                            service_duration: "",
                            selectedTreatments: {},
                            callouts_completed: null,
                        });
                        //setTreatmentData(response.data.treatment_names.split(','));
                    } else {
                        setCustomerServiceData([]);
                        setFormData({
                            customerId: customerId,
                            visit_config_id: null,
                            service_id: "",
                            service_date: today,
                            preferred_time: "",
                            service_duration: "",
                            selectedTreatments: {},
                            callouts_completed: null,
                        });
                        toast.error(response.data.message);
                    }
                } else {
                    console.error(
                        "Failed to fetch customer location data. Error:",
                        response
                    );
                    toast.error("Server not responding. Please try again later.");
                }
            })
            .catch((error) => {
                console.error("Error fetching customer location data:", error);
                toast.error("Server not responding. Please try again later.");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        getCustomerList();
        durationList();
    }, []);
    const durationList = async () => {
        setLoading(true);
        timeDuration()
            .then((response) => {
                if (response && response.data.success) {
                    const durationDetails = response.data.data;
                    setDurationData(durationDetails);
                    
                } else {
                    console.error("Failed to fetch duration list data. Error:", response);
                }
            })
            .catch((error) => {
                console.error("Error fetching duration list data:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    };
    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (name === "service_id") {
            const selectedService = customerServiceData.find((cust) => cust.service_id == value);
            console.log(selectedService);
            if (selectedService) {
                setSelectedService(selectedService);
                console.log(selectedService);
                if (selectedService.call_outs === 'Limited') {
                    if(selectedService.callouts_completed == null){
                        selectedService.callouts_completed = 0;
                    }
                    console.log(selectedService);
                    if (parseInt(selectedService.callouts_completed) >= parseInt(selectedService.no_of_callouts)) {
                        toast.error('Callout limit exceeded');
                        setFormData((prev) => ({ ...prev, service_id: "" }));
                    } else {
                        setFormData((prev) => ({ ...prev, visit_config_id: selectedService.visit_config_id }));
                        setFormData((prev) => ({ ...prev, callouts_completed: selectedService.callouts_completed }));
                    }
                } else {
                    setFormData((prev) => ({ ...prev, visit_config_id: selectedService.visit_config_id }));
                    setFormData((prev) => ({ ...prev, callouts_completed: selectedService.callouts_completed }));
                }

            }
        }
    };
    const onSubmit = async (values: any) => {
        setFormData((prev) => ({ ...prev, ...values }));
        const requestBody =
            {
                visit_config_id: formData.visit_config_id,
                service_id: formData.service_id,
                service_date: formData.service_date,
                preferred_time: formData.preferred_time,
                service_duration: formData.service_duration.split(" ")[0],
                treatment_type: Object.keys(formData.selectedTreatments).join(","),
                callouts_completed: formData.callouts_completed,
            }

        console.log(requestBody);
        try {
            setLoading(true);
            const response = await createCallOut(requestBody);
            console.log("Call Out created successfully:", response.data);
            if (response && response.success) {
                toast.success(response.message);
                setFormData({
                    customerId: '',
                    visit_config_id: null,
                    service_id: "",
                    service_date: today,
                    preferred_time: "",
                    service_duration: "",
                    selectedTreatments: {},
                    callouts_completed: null,
                });
                setLoading(false);
                history.push("/tasks");
            } else {
                // Handle error messages
                toast.error("An unknown error occurred.");
            }
        } catch (error: any) {
            console.error("Error creating task:", error);
            if (error.response && error.response.data && error.response.data[0]) {
                const errorData = error.response.data[0];
                if (errorData.message && typeof errorData.message === "object") {
                    // Loop through all error fields
                    Object.entries(errorData.message).forEach(([field, errors]) => {
                        if (Array.isArray(errors)) {
                            errors.forEach((error) => toast.error(`${field}: ${error}`));
                        } else if (typeof errors === "string") {
                            toast.error(`${field}: ${errors}`);
                        }
                    });
                } else if (typeof errorData.message === "string") {
                    toast.error(errorData.message);
                } else {
                    toast.error("An unknown error occurred.");
                }
            } else {
                toast.error("Network error or server is not responding.");
            }
        }
    };
    useEffect(() => {
        console.log(selectedValue, "selcted value");
    }, [selectedValue]);

    const handlereset = () => {
        setFormData({
            customerId: '',
            visit_config_id: null,
            service_id: "",
            service_date: today,
            preferred_time: "",
            service_duration: "",
            selectedTreatments: {},
            callouts_completed: null,
        });
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
                        <IonBackButton defaultHref={"/dashboard"}></IonBackButton>
                    </IonButtons>
                    <IonTitle className="ion-float-start">Create Callout</IonTitle>
                    <div className="ion-float-end headerBts">
                        <IonButton shape="round" routerLink={"/dashboard"}>
                            <IonImg src="assets/images/home-outline-icon.svg" />
                        </IonButton>
                    </div>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen className="ionContentColor ion-padding-vertical">
            <FullScreenLoader isLoading={loading} />
                <div>
                    <h1 className="headingH1 ion-padding-horizontal">
                        Customer Details
                    </h1>
                    <Formik
                        initialValues={formData}
                        validationSchema={validationSchema}
                        onSubmit={onSubmit}
                        // onSubmit={onSubmit}
                        enableReinitialize
                    >
                        {({ isSubmitting,touched, errors, setFieldValue }) => (
                            <Form>
                                <div className="ion-padding-horizontal ionPaddingBottom">

                                    <IonList className="formlist">
                                        <IonItem lines="none">
                                            <div className="width100">
                                                <IonLabel className="ion-label">Select Customer<IonText>*</IonText>
                                                </IonLabel>
                                                <IonInput
                                                    value={selectedCustomerName} // Display the selected customer name
                                                    readonly // Make the textarea read-only
                                                    onClick={() => modal.current?.present()} // Open modal on click
                                                    style={{
                                                        height: "55px", // Adjust height as needed
                                                        font: "13.76px Poppins,sans-serif",
                                                    }}
                                                ></IonInput>
                                            </div>
                                        </IonItem>
                                        {touched.customerId && errors.customerId && (
                                            <IonText color="danger">
                                                <ErrorMessage name="customerId" />
                                            </IonText>
                                        )}
                                        <IonModal ref={modal}>
                                            <CustomerTypeahead
                                                title="Select Customer"
                                                items={customerData}
                                                selectedItem={formData.customerId}
                                                onSelectionCancel={() => modal.current?.dismiss()}
                                                onSelectionChange={customerSelectionChanged}
                                            />
                                        </IonModal>
                                        {customerServiceData && customerServiceData.length > 0 && (
                                            <>
                                                <IonItem lines="none">
                                                    <div className="width100">
                                                        <IonLabel className="ion-label">Customer Service<IonText>*</IonText>
                                                        </IonLabel>
                                                        <IonSelect
                                                            className="custom-form-control"
                                                            placeholder="Select Customer Service"
                                                            value={formData.service_id}
                                                            onIonChange={(e) => {
                                                                const selectedValue = e.detail.value;
                                                                setFieldValue("service_id", selectedValue);
                                                                handleInputChange({
                                                                    target: {
                                                                        name: "service_id",
                                                                        value: selectedValue,
                                                                    },
                                                                });
                                                            }}
                                                        >
                                                            {customerServiceData.map((data: any) => (
                                                                <IonSelectOption key={data.service_id} value={data.service_id}>
                                                                    {data.service_name} ({data.treatment_names})
                                                                </IonSelectOption>
                                                            ))}
                                                        </IonSelect>
                                                    </div>
                                                </IonItem>
                                                {touched.service_id && errors.service_id && (
                                                    <IonText color="danger">
                                                        <ErrorMessage name="service_id" />
                                                    </IonText>
                                                )}
                                                {/* <IonItem lines="none">
                                                    <div className="width100">
                                                        <IonLabel className="ion-label">Treatment Types<IonText>*</IonText>
                                                        </IonLabel>
                                                        <div className=" ion-padding-horizontal createTask-pestDetails ionPaddingBottom">
                                                            {treatmentData &&
                                                                treatmentData.length > 0 &&
                                                                treatmentData.map((data: any, index: any) => (
                                                                    <IonList className="formlist" key={index}>
                                                                        <IonItem>
                                                                            <IonCheckbox
                                                                                color="secondary"
                                                                                className="width100"
                                                                                justify="space-between"
                                                                                labelPlacement="start"
                                                                                value={data.id}
                                                                                checked
                                                                            >
                                                                                {data.treatment_name}
                                                                            </IonCheckbox>
                                                                        </IonItem>
                                                                    </IonList>
                                                                ))}
                                                        </div>
                                                    </div>
                                                </IonItem> */}
                                                
                                                <IonLabel className="ion-label">Select Date<IonText>*</IonText></IonLabel>
                                                <IonItem lines="none">
                                                    <div className="width100">

                                                        <span className="calendar-icon">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 24 24"
                                                                fill="currentColor"
                                                                width="24px"
                                                                height="24px"
                                                            >
                                                                <path d="M19 4h-1V2h-2v2H8V2H6v2H5C3.9 4 3 4.9 3 6v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
                                                            </svg>
                                                        </span>
                                                        <Field
                                                            name="service_date"
                                                            placeholder="Please select the date"
                                                            type="date"
                                                            className={
                                                                touched.service_date && errors.service_date
                                                                    ? "custom-form-control is-invalid"
                                                                    : "custom-form-control"
                                                            }
                                                            value={formData.service_date}
                                                            onChange={handleInputChange}
                                                            min={today}
                                                        />
                                                    </div>
                                                </IonItem>
                                                {touched.service_date && errors.service_date && (
                                                    <IonText color="danger">
                                                        <ErrorMessage name="service_date" />
                                                    </IonText>
                                                )}
                                                <IonLabel className="ion-label">Preferred Time<IonText>*</IonText></IonLabel>
                                                <IonItem lines="none" className="timer">
                                                    <div className="width100">
                                                        <span className="timer-icon">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 24 24"
                                                                fill="currentColor"
                                                                width="24px"
                                                                height="24px"
                                                            >
                                                                <path d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1zm0 20c-4.971 0-9-4.029-9-9s4.029-9 9-9 9 4.029 9 9-4.029 9-9 9zm1-15h-2v6.414l4.293 4.293 1.414-1.414L13 11.586V6z" />
                                                            </svg>
                                                        </span>

                                                        <Field
                                                            name="preferred_time"
                                                            placeholder="Please select the time"
                                                            type="time"
                                                            className={
                                                                touched.preferred_time && errors.preferred_time
                                                                    ? "custom-form-control is-invalid"
                                                                    : "custom-form-control"
                                                            }
                                                            value={formData.preferred_time}
                                                            onChange={handleInputChange}
                                                        />
                                                    </div>
                                                </IonItem>

                                                {touched.preferred_time && errors.preferred_time && (
                                                    <IonText color="danger">
                                                        <ErrorMessage name="preferred_time" />
                                                    </IonText>
                                                )}
                                                <IonLabel className="ion-label">Service Duration<IonText>*</IonText></IonLabel>
                                                <IonItem lines="none">
                                                    <div className="width100">
                                                        <IonSelect
                                                            className="custom-form-control"
                                                            placeholder="Select Service Duration"
                                                            value={formData.service_duration}
                                                            onIonChange={(e) => {
                                                                const selectedValue = e.detail.value;
                                                                setFieldValue("service_duration", selectedValue);
                                                                handleInputChange({
                                                                    target: {
                                                                        name: "service_duration",
                                                                        value: selectedValue,
                                                                    },
                                                                });
                                                            }}
                                                        >
                                                            {durationData.map((data: any) => (
                                                                <IonSelectOption key={data.id} value={data.id}>
                                                                    {data.duration} hrs
                                                                </IonSelectOption>
                                                            ))}
                                                        </IonSelect>
                                                    </div>
                                                </IonItem>
                                                {touched.service_duration && errors.service_duration && (
                                                    <IonText color="danger">
                                                        <ErrorMessage name="service_duration" />
                                                    </IonText>
                                                )}
                                            </>)}
                                    </IonList>

                                </div>

                                <IonFooter className="ion-footer ion-footerPosition">
                                    <IonToolbar className="ionFooterTwoButtons">
                                        <IonButton
                                            className="ion-button"
                                            fill="outline"
                                            color="medium"
                                            onClick={() => handlereset()}
                                        >
                                            RESET
                                        </IonButton>
                                        <IonButton
                                            className="ion-button"
                                            color="primary"
                                            type="submit"
                                            //disabled={isSubmitting}
                                            disabled={!formData.customerId || !formData.service_id || !formData.visit_config_id || !formData.service_date || !formData.preferred_time || !formData.service_duration}
                                        >
                                            SUBMIT
                                        </IonButton>
                                    </IonToolbar>
                                </IonFooter>
                            </Form>
                        )}
                    </Formik>
                </div>
            </IonContent>
        </>
    );
};

export default CreateCallOut;