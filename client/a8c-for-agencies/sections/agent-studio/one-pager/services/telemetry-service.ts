import type { TelemetryService } from './types';

// Default impl is a no-op; the React layer constructs a Tracks-backed
// impl that has a redux dispatch in scope. Keeping the default no-op lets
// non-React callers (tests, future server impls) use the engine without
// pulling in calypso/state.
export const noopTelemetryService: TelemetryService = {
	trackGenerationStarted() {
		// No-op.
	},
	trackGenerationCompleted() {
		// No-op.
	},
	trackGenerationFailed() {
		// No-op.
	},
	trackDownload() {
		// No-op.
	},
};
