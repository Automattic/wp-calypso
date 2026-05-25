declare module '*.module.css' {
	const classes: { [ key: string ]: string };
	export default classes;
}
declare module '*.module.scss' {
	const classes: { [ key: string ]: string };
	export default classes;
}

declare const process: {
	env: {
		NODE_ENV: string;
	};
};
