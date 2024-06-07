import { useExperiment } from 'calypso/lib/explat';
import SiteAdminInterface from './';

interface Props {
	siteId: number;
}

const SiteAdminInterfaceExperiment = ( { siteId }: Props ) => {
	const [ isLoading, assignment ] = useExperiment( 'calypso_site_settings_simple_classic' );

	if ( isLoading || assignment?.variationName !== 'treatment' ) {
		return null;
	}

	return <SiteAdminInterface siteId={ siteId } />;
};

export default SiteAdminInterfaceExperiment;
