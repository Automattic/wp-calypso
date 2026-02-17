import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteSpec } from 'calypso/lib/site-spec';
import { getCiabSiteSpecConfig, type SiteSpecConfig } from 'calypso/lib/site-spec/utils';
import type { Step as StepType } from '../../types';

const SiteSpec: StepType = function SiteSpec() {
	const translate = useTranslate();
	// Use the SiteSpec hook to handle the loading and initialization of the SiteSpec widget
	const queryParams = useQuery();
	const source = queryParams.get( 'source' );

	let siteSpecConfig: SiteSpecConfig | undefined;
	if ( source && source.startsWith( 'ciab-' ) ) {
		siteSpecConfig = getCiabSiteSpecConfig() as SiteSpecConfig;
	}

	useSiteSpec( { siteSpecConfig } );

	return (
		<>
			<DocumentHead title={ translate( 'Build Your Site with AI' ) } />
			<div id="site-spec-container" style={ { height: '100vh' } } />
		</>
	);
};

export default SiteSpec;
