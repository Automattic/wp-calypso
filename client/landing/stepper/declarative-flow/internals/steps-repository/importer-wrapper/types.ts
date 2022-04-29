import { SiteDetails } from '@automattic/data-stores/dist/types/site';
import { PropsWithChildren } from 'react';
import { StepProps } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { Importer, ImportJob } from 'calypso/signup/steps/import-from/types';

export type ImporterWrapperRefAttr = {
	run: boolean;
	site: SiteDetails;
	siteId: number;
	siteSlug: string;
	fromSite: string;
	job?: ImportJob;
	navigator?: ( path: string ) => void;
};

interface AdditionalProps {
	importer: Importer;
}

export type ImporterWrapperProps = PropsWithChildren< StepProps & AdditionalProps >;
