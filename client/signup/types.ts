export interface Dependencies {
	[ other: string ]: any;
}

export interface Flow {
	name: string;
	steps: string[];
	destination:
		| string
		| ( (
				dependencies: Dependencies,
				localeSlug: string,
				goesThroughCheckout?: boolean
		  ) => string );
	description: string;
	lastModified: string;
	pageTitle?: string;
	providesDependenciesInQuery?: string[];
	optionalDependenciesInQuery?: string[];
	disallowResume?: boolean;
	showRecaptcha?: boolean;
	enableBranchSteps?: boolean;
	onEnterFlow?: ( flowName: string ) => void;
}

export type GoToStep = ( stepName: string, stepSectionName?: string, flowName?: string ) => void;

export type GoToNextStep = ( nextFlowName?: string ) => void;
