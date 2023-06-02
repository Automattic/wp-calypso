export interface TracksEventProperties {
	[ key: string ]: boolean | number | string;
}
export type TracksEvent = [ string, TracksEventProperties ];
