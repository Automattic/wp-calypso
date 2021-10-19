export interface Dependencies {
	[ other: string ]: string[];
}

export interface Flow {
	name: string;
	steps: string[];
	destination: string | ( ( dependencies: Dependencies ) => string );
	description: string;
	lastModified: string;
	pageTitle?: string;
	providesDependenciesInQuery?: string[];
	optionalDependenciesInQuery?: string[];
	disallowResume?: boolean;
	showRecaptcha?: boolean;
	enableBranchSteps?: boolean;
}
