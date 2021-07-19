// FUTURE WORK: universal typings location
// FUTURE WORK: investigate shape of this object
// FUTURE WORK: type this as soon as it comes back from the API
export interface Activity {
	streams?: Activity[];
	activityMedia?: {
		available: boolean;
		medium_url: string;
		type: 'Image' | string;
		name: string;
		url: string;
		thumbnail_url: string;
	};
}
