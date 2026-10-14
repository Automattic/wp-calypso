import { Outlet } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { agencySiteRoute } from '../../../app/router/agency';
import FlashMessage from '../../../components/flash-message';

// The route loader throws `notFound()` when the site isn't in the agency's
// list, so children can rely on the site existing.
export default function AgencySite() {
	const { siteSlug } = agencySiteRoute.useParams();

	return (
		<>
			<FlashMessage
				id="route-not-allowed"
				key={ siteSlug }
				type="error"
				message={ __( 'You don’t have permission to view the requested page.' ) }
			/>
			<Outlet />
		</>
	);
}
