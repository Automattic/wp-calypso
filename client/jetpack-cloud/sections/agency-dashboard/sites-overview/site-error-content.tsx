import { Gridicon } from '@automattic/components';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { urlToSlug } from 'calypso/lib/url/http-utils';
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
	const siteSlug = urlToSlug( siteUrl );
	const disconnectQueryArgs = {
		site_id: siteId,
		site_url: siteSlug,
		type: 'down',
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
					href={ addQueryArgs( `/settings/disconnect-site/${ siteSlug }`, disconnectQueryArgs ) }
				>
					{ translate( 'Fix now' ) }
				</a>
				<a
					className="sites-overview__error-message-link"
					href={ addQueryArgs(
						`/settings/disconnect-site/confirm/${ siteSlug }`,
						disconnectQueryArgs
					) }
				>
					{ translate( 'Remove site' ) }
				</a>
			</span>
		</div>
	);
}
