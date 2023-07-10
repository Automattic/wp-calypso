import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { SiteItemThumbnail } from 'calypso/sites-dashboard/components/sites-site-item-thumbnail';
import { SiteUrl, Truncated } from 'calypso/sites-dashboard/components/sites-site-url';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import './style.scss';
import { SitePreviewEllipsisMenu } from './site-preview-ellipsis-menu';

const SitePreview = (): JSX.Element => {
	const { __ } = useI18n();
	const selectedSite = useSelector( getSelectedSite );

	if ( ! selectedSite ) {
		return <div></div>;
	}

	const editSiteSlug = addQueryArgs( `/site-editor/${ selectedSite.slug }`, {
		canvas: 'edit',
	} );

	return (
		<div className="home-site-preview">
			<a
				onClick={ ( event ) => {
					event.preventDefault();

					recordTracksEvent( 'calypso_customer_home_site_preview_clicked', {
						context: 'customer-home',
					} );

					window.location.href = event.currentTarget.href;
				} }
				className="home-site-preview__thumbnail-wrapper"
				href={ editSiteSlug }
			>
				<div className="home-site-preview__thumbnail-label"> { __( 'Edit site' ) } </div>
				<SiteItemThumbnail
					displayMode="tile"
					className="home-site-preview__thumbnail"
					site={ selectedSite }
					width={ 312 }
					height={ 312 }
				/>
			</a>
			<div className="home-site-preview__action-bar">
				<div className="home-site-preview__site-info">
					<h2 className="home-site-preview__info-title">{ selectedSite.name }</h2>
					<SiteUrl href={ selectedSite.URL } title={ selectedSite.URL }>
						<Truncated>{ selectedSite.URL }</Truncated>
					</SiteUrl>
				</div>
				<SitePreviewEllipsisMenu />
			</div>
		</div>
	);
};

export default SitePreview;
