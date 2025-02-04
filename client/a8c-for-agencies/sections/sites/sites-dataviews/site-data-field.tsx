import { Badge, Button } from '@automattic/components';
import { translate } from 'i18n-calypso';
import SiteFavicon from 'calypso/blocks/site-favicon';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import { Site, SiteError } from '../types';
import SiteDataFieldErrorIndicator from './site-data-field-error-indicator';

interface SiteDataFieldProps {
	isLoading: boolean;
	site: Site;
	isDevSite?: boolean;
	errors?: SiteError[];
	onSiteTitleClick: ( site: Site ) => void;
}

const SiteDataField = ( {
	isLoading,
	site,
	isDevSite,
	errors,
	onSiteTitleClick,
}: SiteDataFieldProps ) => {
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
				className="sites-dataviews__site-favicon"
			/>
			<div className="sites-dataviews__site-name">
				<div>{ site.blogname }</div>
				{ ! migrationInProgress && <div className="sites-dataviews__site-url">{ site.url }</div> }
				{ migrationInProgress && (
					<Badge className="status-badge" type="info-blue">
						{ translate( 'Migration in progress' ) }
					</Badge>
				) }
				{ isDevSite && (
					<Badge className="status-badge" type="info-purple">
						{ translate( 'Development' ) }
					</Badge>
				) }
			</div>
			<SiteDataFieldErrorIndicator errors={ errors } />
		</Button>
	);
};

export default SiteDataField;
