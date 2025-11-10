declare const process: {
	env?: {
		NODE_ENV?: string;
	};
};

export const isDevelopmentMode = process.env?.NODE_ENV === 'development';
