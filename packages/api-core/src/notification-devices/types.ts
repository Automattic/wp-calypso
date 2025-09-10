export interface NotificationsDevice {
	device_name: string;
	device_token: PushSubscription;
	device_family: string;
}

export interface NotificationsDeviceResponse {
	ID: string;
	// TODO: Add more fields as needed
}
