import { Dispatch, SetStateAction } from 'react';
import { StepStatus } from 'calypso/data/paid-newsletter/use-paid-newsletter-query';
import { appStates } from 'calypso/state/imports/constants';
import type { SiteDetails } from '@automattic/data-stores';

export type EngineTypes = 'substack';

export type ImporterState = ( typeof appStates )[ keyof typeof appStates ];
export interface SubscribersStepProps {
	cardData: any;
	status: StepStatus;
	engine: 'substack';
	fromSite: string;
	nextStepUrl: string;
	selectedSite: SiteDetails;
	setAutoFetchData: Dispatch< SetStateAction< boolean > >;
	siteSlug: string;
	skipNextStep: () => void;
}
