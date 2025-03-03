import { NextButton } from '@automattic/onboarding';
import styled from '@emotion/styled';
import type { GoToStep, GoToNextStep } from '../../types';

export interface WooCommerceInstallProps {
	siteId: number;
	goToStep: GoToStep;
	goToNextStep: GoToNextStep;
	stepName: string;
	stepSectionName: string;
	headerTitle: string;
	headerDescription: string;
	queryObject: {
		siteSlug: string;
	};
	signupDependencies: {
		siteSlug: string;
		siteConfirmed?: number;
	};
}
export interface WooCommerceStoreAddressProps {
	siteId: number;
	goToStep: GoToStep;
	goToNextStep: GoToNextStep;
	stepName: string;
	stepSectionName: string;
	headerTitle: string;
	headerDescription: string;
	queryObject: {
		site: string;
	};
	signupDependencies: {
		site: string;
		siteConfirmed?: number;
		back_to?: string;
	};
}

export const ActionSection = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: baseline;
	flex-wrap: wrap;
	margin-top: 40px;
	gap: 4%;

	@media ( max-width: 320px ) {
		align-items: center;
	}
`;

export const StyledNextButton = styled( NextButton )`
	@media ( max-width: 320px ) {
		width: 100%;
		margin-bottom: 20px;
	}
`;
