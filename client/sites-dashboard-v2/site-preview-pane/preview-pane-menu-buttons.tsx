import { Button } from '@automattic/components';
import { SiteExcerptData } from '@automattic/sites';
import { useI18n } from '@wordpress/react-i18n';
import SiteEnvironmentDropdown from 'calypso/sites-dashboard-v2/site-preview-pane/site-environment-dropdown';

interface PreviewPaneMenuButtonsProps {
	site: SiteExcerptData;
	changeSitePreviewPane: ( siteId: number ) => void;
}

export default function PreviewPaneMenuButtons( {
	site,
	changeSitePreviewPane,
}: PreviewPaneMenuButtonsProps ) {
	const { __ } = useI18n();

	return (
		<div className="site-preview-pane__menu-buttons">
			{ site.is_wpcom_atomic &&
				( ( site.options?.wpcom_staging_blog_ids &&
					site.options?.wpcom_staging_blog_ids.length > 0 ) ||
					site.is_wpcom_staging_site ) && (
					<SiteEnvironmentDropdown onChange={ changeSitePreviewPane } site={ site } />
				) }
			{ site.is_wpcom_atomic &&
				! site.is_wpcom_staging_site &&
				site.options?.wpcom_staging_blog_ids &&
				site.options?.wpcom_staging_blog_ids.length === 0 && (
					<Button
						className="site-preview-pane__create-staging-site-button"
						compact
						href={ `/staging-site/${ site.slug }` }
					>
						{ __( 'Create staging site' ) }
					</Button>
				) }
		</div>
	);
}
