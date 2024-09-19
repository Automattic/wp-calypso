import { QueryArgParsed } from '@wordpress/url/build-types/get-query-arg';
import { Dispatch, SetStateAction } from 'react';
import type { SiteDetails } from '@automattic/data-stores';

export type EngineTypes = 'substack';

export type StatusType = 'initial' | 'done' | 'pending' | 'skipped' | 'importing';

export interface SubscribersStepProps {
	cardData: any;
	status: StatusType;
	engine: 'substack';
	fromSite: QueryArgParsed;
	isFetchingContent: boolean;
	nextStepUrl: string;
	selectedSite: SiteDetails;
	setAutoFetchData: Dispatch< SetStateAction< boolean > >;
	siteSlug: string;
	skipNextStep: () => void;
}
