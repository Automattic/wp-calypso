import { useExperiment } from 'calypso/lib/explat';
import SiteAdminInterface from './';

interface Props {
	siteId: number;
	siteSlug: string;
}

const SiteAdminInterfaceExperiment = ( { siteId, siteSlug }: Props ) => {
	const [ isLoading, assignment ] = useExperiment( 'calypso_site_settings_simple_classic' );

	if ( isLoading || assignment?.variationName !== 'treatment' ) {
		return null;
	}

	return <SiteAdminInterface siteId={ siteId } siteSlug={ siteSlug } />;
};

export default SiteAdminInterfaceExperiment;
