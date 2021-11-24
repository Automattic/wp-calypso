import type { GoToStep } from '../../types';

export interface WooCommerceInstallProps {
	goToStep: GoToStep;
	stepName: string;
	stepSectionName: string;
	isReskinned: boolean;
	headerTitle: string;
	headerDescription: string;
	queryObject: {
		siteSlug: string;
	};
}
