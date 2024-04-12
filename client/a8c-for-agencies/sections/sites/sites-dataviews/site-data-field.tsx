import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import useFetchTestConnection from 'calypso/data/agency-dashboard/use-fetch-test-connection';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import { useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import SiteFavicon from '../site-favicon';
import { Site } from '../types';

interface SiteDataFieldProps {
	isLoading: boolean;
	site: Site;
	onSiteTitleClick: ( site: Site ) => void;
}

const SiteDataField = ( { isLoading, site, onSiteTitleClick }: SiteDataFieldProps ) => {
	const translate = useTranslate();
	const blogId = site.blog_id;
	const isConnectionHealthy = site.is_connection_healthy;
	const agency = useSelector( getActiveAgency );
	const agencyId = agency ? agency.id : undefined;

	const { data } = useFetchTestConnection( true, isConnectionHealthy, blogId, agencyId );
	const isSiteConnected = data?.connected ?? true;

	if ( isLoading ) {
		return <TextPlaceholder />;
	}

	return (
		<Button
			className={
				isSiteConnected ? 'sites-dataviews__site' : 'sites-dataviews__site is-disconnected'
			}
			onClick={ isSiteConnected ? () => onSiteTitleClick( site ) : undefined }
			borderless
		>
			<SiteFavicon site={ site } />
			<div className="sites-dataviews__site-name">
				{ isSiteConnected ? null : (
					<div className="sites-dataviews__site-disconnected">
						{ translate( 'Site unreachable' ) }
					</div>
				) }
				{ site.blogname }
				<div className="sites-dataviews__site-url">{ site.url }</div>
			</div>
		</Button>
	);
};

export default SiteDataField;
