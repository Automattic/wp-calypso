// Because these types are ultimately accessed on "window", adding them here.
export interface TracksEventProperties {
	[ key: string ]: boolean | number | string;
}
export type TracksEvent = [ string, TracksEventProperties ];
