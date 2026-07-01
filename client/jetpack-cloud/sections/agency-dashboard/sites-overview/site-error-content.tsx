import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { urlToSlug } from 'calypso/lib/url/http-utils';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export default function SiteErrorContent( { siteUrl }: { siteUrl: string } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const siteSlug = urlToSlug( siteUrl );

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
					href={ `/settings/disconnect-site/${ siteSlug }?type=down` }
				>
					{ translate( 'Fix now' ) }
				</a>
				<a
					className="sites-overview__error-message-link"
					href={ `/settings/disconnect-site/confirm/${ siteSlug }?type=down` }
				>
					{ translate( 'Remove site' ) }
				</a>
			</span>
		</div>
	);
}
