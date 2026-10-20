import type { TracksEvent } from './types/editor-tracks.types';

declare global {
	interface Window {
		_e2eEventsStack: TracksEvent[];
	}
}
