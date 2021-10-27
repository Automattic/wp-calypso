export type GoToStep = ( stepName: string, stepSectionName?: string ) => void;
export type GoToNextStep = () => void;
export type submitSignupStep = (
	step: { stepName: string },
	providedDependencies?: unknown
) => void;
