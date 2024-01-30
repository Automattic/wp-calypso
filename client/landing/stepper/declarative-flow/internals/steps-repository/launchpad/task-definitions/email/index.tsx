import { Task } from '@automattic/launchpad';
import { recordTaskClickTracksEvent } from '../../tracking';
import { TaskAction } from '../../types';

export const getVerifyEmail: TaskAction = ( task, flow, context ): Task => {
	const { isEmailVerified } = context;

	return {
		...task,
		completed: isEmailVerified || false,
		actionDispatch: () => recordTaskClickTracksEvent( task, flow, context ),
		useCalypsoPath: true,
	};
};

export const actions = {
	verify_email: getVerifyEmail,
};
