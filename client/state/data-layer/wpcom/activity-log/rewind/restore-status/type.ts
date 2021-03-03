export interface RestoreProgress {
	errorCode: string;
	failureReason: string;
	message: string;
	percent: number;
	status: string;
	rewindId: string;
	context: string;
	currentEntry: string;
}
