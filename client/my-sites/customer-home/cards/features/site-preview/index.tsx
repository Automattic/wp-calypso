import { isMobile } from '@automattic/viewport';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import classnames from 'classnames';
import { ReactNode } from 'react';
import withIsFSEActive from 'calypso/data/themes/with-is-fse-active';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { SiteUrl, Truncated } from 'calypso/sites-dashboard/components/sites-site-url';
import { useSelector } from 'calypso/state';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import './style.scss';
import { SitePreviewEllipsisMenu } from './site-preview-ellipsis-menu';

interface ThumbnailWrapperProps {
	showEditSite: boolean;
	editSiteURL: string;
	children?: ReactNode;
}
const ThumbnailWrapper = ( { showEditSite, editSiteURL, children }: ThumbnailWrapperProps ) => {
	const classes = classnames( 'home-site-preview__thumbnail-wrapper', {
		'home-site-preview__remove-pointer': ! showEditSite,
	} );

	if ( showEditSite ) {
		return (
			<a
				onClick={ ( event ) => {
					event.preventDefault();

					recordTracksEvent( 'calypso_customer_home_site_preview_clicked', {
						context: 'customer-home',
					} );

					window.location.href = event.currentTarget.href;
				} }
				className={ classes }
				href={ editSiteURL }
			>
				{ children }
			</a>
		);
	}

	return <div className={ classes }> { children } </div>;
};

interface SitePreviewProps {
	isFSEActive: boolean;
}

const SitePreview = ( { isFSEActive }: SitePreviewProps ): JSX.Element => {
	const { __ } = useI18n();
	const selectedSite = useSelector( getSelectedSite );
	const canManageSite = useSelector( ( state ) =>
		canCurrentUser( state, selectedSite?.ID ?? 0, 'manage_options' )
	);

	if ( isMobile() || ! selectedSite ) {
		return <div></div>;
	}

	const shouldShowEditSite = isFSEActive && canManageSite;

	const editSiteURL = addQueryArgs( `/site-editor/${ selectedSite.slug }`, {
		canvas: 'edit',
	} );

	const iframeSrcKeepHomepage = `//${ selectedSite.domain }/?hide_banners=true&preview_overlay=true`;

	return (
		<div className="home-site-preview">
			<ThumbnailWrapper showEditSite={ shouldShowEditSite } editSiteURL={ editSiteURL }>
				{ shouldShowEditSite && (
					<div className="home-site-preview__thumbnail-label"> { __( 'Edit site' ) } </div>
				) }
				<div className="home-site-preview__thumbnail-iframe-wrapper">
					<iframe scrolling="no" loading="lazy" title="title" src={ iframeSrcKeepHomepage } />
				</div>
			</ThumbnailWrapper>
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

export default withIsFSEActive( SitePreview );
