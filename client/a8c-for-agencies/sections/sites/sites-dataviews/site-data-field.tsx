import config from '@automattic/calypso-config';
import { Badge, Button } from '@automattic/components';
import { translate } from 'i18n-calypso';
import SiteFavicon from 'calypso/a8c-for-agencies/components/items-dashboard/site-favicon';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import { Site } from '../types';

interface SiteDataFieldProps {
	isLoading: boolean;
	site: Site;
	isDevSite?: boolean;
	onSiteTitleClick: ( site: Site ) => void;
}

const SiteDataField = ( { isLoading, site, isDevSite, onSiteTitleClick }: SiteDataFieldProps ) => {
	if ( isLoading ) {
		return <TextPlaceholder />;
	}

	const migrationInProgress = site.sticker?.includes( 'migration-in-progress' );
	const devSitesEnabled = config.isEnabled( 'a4a-dev-sites' );

	return (
		<Button
			disabled={ migrationInProgress }
			className="sites-dataviews__site"
			onClick={ () => onSiteTitleClick( site ) }
			borderless
		>
			<SiteFavicon
				blogId={ site.blog_id }
				fallback={ site.is_atomic ? 'wordpress-logo' : 'color' }
			/>
			<div className="sites-dataviews__site-name">
				<div>{ site.blogname }</div>
				{ ! migrationInProgress && <div className="sites-dataviews__site-url">{ site.url }</div> }
				{ migrationInProgress && (
					<Badge className="status-badge" type="info-blue">
						{ translate( 'Migration in progress' ) }
					</Badge>
				) }
				{ devSitesEnabled && isDevSite && (
					<Badge className="status-badge" type="info-purple">
						{ translate( 'Development' ) }
					</Badge>
				) }
			</div>
		</Button>
	);
};

export default SiteDataField;
