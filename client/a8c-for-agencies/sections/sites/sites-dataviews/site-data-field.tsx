import { Badge, Button } from '@automattic/components';
import { translate } from 'i18n-calypso';
import SiteFavicon from 'calypso/a8c-for-agencies/components/items-dashboard/site-favicon';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import { Site } from '../types';

interface SiteDataFieldProps {
	isLoading: boolean;
	site: Site;
	onSiteTitleClick: ( site: Site ) => void;
}

const SiteDataField = ( { isLoading, site, onSiteTitleClick }: SiteDataFieldProps ) => {
	if ( isLoading ) {
		return <TextPlaceholder />;
	}

	const migrationInProgress = site.sticker?.includes( 'migration-in-progress' );

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
					<Badge className="migration-badge" type="info-blue">
						{ translate( 'Migration in progress' ) }
					</Badge>
				) }
			</div>
		</Button>
	);
};

export default SiteDataField;
