import type { GoToStep, GoToNextStep } from '../../types';

export interface WooCommerceInstallProps {
	siteId: number;
	goToStep: GoToStep;
	goToNextStep: GoToNextStep;
	stepName: string;
	stepSectionName: string;
	isReskinned: boolean;
	headerTitle: string;
	headerDescription: string;
	queryObject: {
		site: string;
	};
	signupDependencies: {
		site: string;
		siteConfirmed?: number;
	};
}
