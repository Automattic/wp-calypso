import { Outlet } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { shield } from '@wordpress/icons';
import { useSiteFeatureAccess } from '../../app/hooks/use-site-access';
import { siteRoute } from '../../app/router/sites';
import FeatureNotEnabled from '../feature-not-enabled';

export default function SiteScanLayout() {
	const { siteSlug } = siteRoute.useParams();
	const variantAccess = useSiteFeatureAccess( siteSlug, 'scan' );

	if ( variantAccess === false ) {
		return (
			<FeatureNotEnabled
				title={ __( 'Scan' ) }
				icon={ shield }
				message={ __( 'Scan isn’t enabled for this site.' ) }
			/>
		);
	}

	return <Outlet />;
}
