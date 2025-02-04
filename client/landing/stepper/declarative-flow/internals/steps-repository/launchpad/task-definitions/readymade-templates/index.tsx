import { TaskAction } from '../../types';

export const getGenerateContentTask: TaskAction = ( task ) => {
	return {
		...task,
		useCalypsoPath: true,
	};
};

export const actions = {
	generate_content: getGenerateContentTask,
};
