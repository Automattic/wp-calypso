import { QueryArgParsed } from '@wordpress/url/build-types/get-query-arg';
import { Dispatch, SetStateAction } from 'react';
import type { SiteDetails } from '@automattic/data-stores';

export type engineTypes = 'substack';

type statusType = 'initial' | 'done' | 'pending' | 'skipped' | 'importing';

export type StepProps = {
	cardData: any; // TODO: Map to the backend.
	status: statusType;
	engine: engineTypes;
	fromSite: QueryArgParsed;
	isFetchingContent: boolean;
	nextStepUrl: string;
	selectedSite: SiteDetails;
	setAutoFetchData: Dispatch< SetStateAction< boolean > >;
	siteSlug: string;
	skipNextStep: () => void;
};
