export interface Flow {
	name: string;
	steps: string[];
	destination: ( dependencies: any ) => string;
	description: string;
	lastModified: string;
	pageTitle?: string;
	providesDependenciesInQuery?: string[];
	disallowResume?: boolean;
	showRecaptcha?: boolean;
}
