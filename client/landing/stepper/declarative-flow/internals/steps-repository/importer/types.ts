import { SiteDetails } from '@automattic/data-stores/dist/types/site';
import { PropsWithChildren } from 'react';
import { StepProps } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { Importer, ImportJob } from 'calypso/signup/steps/import-from/types';
import { UrlData } from 'calypso/signup/steps/import/types';

export type ImporterWrapperRefAttr = {
	run: boolean;
	site: SiteDetails;
	siteId: number;
	siteSlug: string;
	fromSite: string;
	urlData: UrlData;
	job?: ImportJob;
	navigator?: ( path: string ) => void;
};

export interface AdditionalProps {
	importer: Importer;
}

export type ImporterWrapperProps = PropsWithChildren< StepProps & AdditionalProps >;
