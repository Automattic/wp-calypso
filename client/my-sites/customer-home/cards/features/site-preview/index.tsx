import { Button } from '@automattic/components';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import classnames from 'classnames';
import { ReactNode } from 'react';
import withIsFSEActive from 'calypso/data/themes/with-is-fse-active';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { SiteUrl, Truncated } from 'calypso/sites-dashboard/components/sites-site-url';
import { useSelector } from 'calypso/state';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getWpComDomainBySiteId } from 'calypso/state/sites/domains/selectors';
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

	if ( ! showEditSite ) {
		return <div className={ classes }> { children } </div>;
	}

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
};

interface SitePreviewProps {
	isFSEActive: boolean;
	showEditSite: boolean;
	showSiteDetails: boolean;
}

const SitePreview = ( {
	isFSEActive,
	showEditSite = true,
	showSiteDetails = true,
}: SitePreviewProps ): JSX.Element => {
	const { __ } = useI18n();
	const selectedSite = useSelector( getSelectedSite );
	const canManageSite = useSelector( ( state ) =>
		canCurrentUser( state, selectedSite?.ID ?? 0, 'manage_options' )
	);
	const isMobile = useMobileBreakpoint();
	const wpcomDomain = useSelector( ( state ) => getWpComDomainBySiteId( state, selectedSite?.ID ) );

	if ( isMobile || ! selectedSite || ! wpcomDomain ) {
		return <></>;
	}

	const shouldShowEditSite = isFSEActive && showEditSite && canManageSite;

	const editSiteURL = addQueryArgs( `/site-editor/${ selectedSite.slug }`, {
		canvas: 'edit',
	} );

	const iframeSrcKeepHomepage = `//${ wpcomDomain.domain }/?hide_banners=true&preview_overlay=true&preview=true`;

	return (
		<div className="home-site-preview">
			<ThumbnailWrapper showEditSite={ shouldShowEditSite } editSiteURL={ editSiteURL }>
				{ shouldShowEditSite && (
					<Button primary className="home-site-preview__thumbnail-label">
						{ __( 'Edit site' ) }
					</Button>
				) }
				<div className="home-site-preview__thumbnail">
					<iframe
						scrolling="no"
						loading="lazy"
						title={ __( 'Site Preview' ) }
						src={ iframeSrcKeepHomepage }
					/>
				</div>
			</ThumbnailWrapper>
			{ showSiteDetails && (
				<div className="home-site-preview__action-bar">
					<div className="home-site-preview__site-info">
						<h2 className="home-site-preview__info-title">{ selectedSite.name }</h2>
						<SiteUrl href={ selectedSite.URL } title={ selectedSite.URL }>
							<Truncated>{ selectedSite.slug }</Truncated>
						</SiteUrl>
					</div>
					<SitePreviewEllipsisMenu />
				</div>
			) }
		</div>
	);
};

export default withIsFSEActive( SitePreview );
