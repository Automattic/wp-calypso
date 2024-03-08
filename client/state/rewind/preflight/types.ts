export enum PreflightTestStatus {
	SUCCESS = 'success',
	IN_PROGRESS = 'in-progress',
	PENDING = 'pending',
	FAILED = 'failed',
}

export interface PreflightTest {
	test: string;
	status: PreflightTestStatus;
}

export interface PreflightState {
	overallStatus: PreflightTestStatus;
	tests: PreflightTest[];
}
