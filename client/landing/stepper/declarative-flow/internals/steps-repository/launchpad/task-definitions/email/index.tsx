import { Task } from '@automattic/launchpad';
import { TaskAction } from '../../types';

export const getVerifyEmail: TaskAction = ( task, flow, context ): Task => {
	const { isEmailVerified } = context;

	return {
		...task,
		completed: isEmailVerified || false,
		useCalypsoPath: true,
	};
};

export const actions = {
	verify_email: getVerifyEmail,
};
