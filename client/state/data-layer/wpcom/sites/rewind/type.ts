export interface RewindState {
	state: string;
	rewind?: {
		status: 'queued' | 'running' | 'finished' | 'fail';
	};
}
