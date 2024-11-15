import { Badge, Button } from '@automattic/components';
import { Icon, external } from '@wordpress/icons';
import { translate } from 'i18n-calypso';
import SiteFavicon from 'calypso/a8c-for-agencies/components/items-dashboard/site-favicon';
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
			/>
			<div className="sites-dataviews__site-name">
				<div>{ site.blogname }</div>
				{ ! migrationInProgress && (
					<a
						className="sites-dataviews__site-url"
						href={ site.url_with_scheme }
						title={ site.url_with_scheme }
						target="_blank"
						rel="noreferrer"
						onClick={ ( e ) => e.stopPropagation() }
					>
						{ site.url } <Icon icon={ external } size={ 16 } />
					</a>
				) }
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
