import { SiteDetails } from '@automattic/data-stores/dist/types/site';
import { PropsWithChildren } from 'react';
import { StepProps } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { Importer } from 'calypso/signup/steps/import-from/types';

export type ImporterWrapperRefAttr = {
	site: SiteDetails;
	siteId: number;
	siteSlug: string;
	siteImports: object[];
	fromSite: string;
};

interface AdditionalProps {
	importer: Importer;
}

export type ImporterWrapperProps = PropsWithChildren< StepProps & AdditionalProps >;
