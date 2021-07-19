export interface MultiStepComponentObjectModel {
	waitUntilSettled?(): Promise< void >;
	initializeState?(): Promise< void >;
	validateStartingLayout?(): Promise< void >;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MultiStepPageObjectModel extends MultiStepComponentObjectModel {
	// anything we want to add here that would be unique for a page over a component
}

export interface SimpleComponentObjectModel {
	initialize(): Promise< void >;
}
