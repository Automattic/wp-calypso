import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import {
	getDisconnectedAgencySiteRemovalHref,
	getDisconnectedAgencySiteTroubleshootingHref,
} from 'calypso/jetpack-cloud/sections/utils/agency-disconnect-site-paths';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export default function SiteErrorContent( {
	siteId,
	siteUrl,
}: {
	siteId: number;
	siteUrl: string;
} ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const linkArgs = {
		siteId,
		siteUrl,
	};

	const handleClickFixNow = () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_agency_dashboard_fix_connection_click' ) );
	};

	return (
		<div className="sites-overview__error-container">
			<span className="sites-overview__error-icon">
				<Gridicon size={ 18 } icon="notice-outline" />
			</span>
			<span className="sites-overview__error-message sites-overview__error-message-large-screen">
				{ translate( 'Jetpack is unable to connect to this site' ) }
			</span>
			<span className="sites-overview__error-message sites-overview__error-message-small-screen">
				{ translate( 'Jetpack is unable to connect' ) }
			</span>
			<span className="sites-overview__error-actions">
				<a
					onClick={ handleClickFixNow }
					className="sites-overview__error-message-link"
					href={ getDisconnectedAgencySiteTroubleshootingHref( linkArgs ) }
				>
					{ translate( 'Fix now' ) }
				</a>
				<a
					className="sites-overview__error-message-link"
					href={ getDisconnectedAgencySiteRemovalHref( linkArgs ) }
				>
					{ translate( 'Remove site' ) }
				</a>
			</span>
		</div>
	);
}
