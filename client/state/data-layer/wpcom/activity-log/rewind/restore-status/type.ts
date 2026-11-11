export interface RestoreProgress {
	errorCode: string;
	/** The `data.known_threats` of a `threats_not_acknowledged` refusal, unvalidated. */
	knownThreats?: unknown;
	failureReason: string;
	message: string;
	percent: number;
	status: string;
	rewindId: string;
	context: string;
	currentEntry: string;
}
