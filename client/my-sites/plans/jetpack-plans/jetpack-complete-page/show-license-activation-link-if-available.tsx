import { useMobileBreakpoint } from '@automattic/viewport-react';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import {
	getUserLicensesCounts,
	hasFetchedUserLicensesCounts,
} from 'calypso/state/user-licensing/selectors';

import './style.scss';

interface Props {
	siteId: number | null;
}

function ShowLicenseActivationLinkIfAvailable( { siteId }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const siteAdminUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId ) );
	const jetpackDashboardUrl = siteAdminUrl + 'admin.php?page=jetpack#/license/activation';
	const userLicensesCounts = useSelector( getUserLicensesCounts );
	const hasFetchedLicensesCounts = useSelector( hasFetchedUserLicensesCounts );
	const hasDetachedLicenses = userLicensesCounts && userLicensesCounts[ 'detached' ] !== 0;
	const isMobile = useMobileBreakpoint();

	useEffect( () => {
		if ( siteId && hasDetachedLicenses ) {
			dispatch(
				recordTracksEvent( 'calypso_post_connection_complete_page_license_link_render', {
					site_id: siteId,
				} )
			);
		}
	}, [ dispatch, hasDetachedLicenses, siteId ] );

	const onLinkClick = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_post_connection_complete_page_license_link_clicked', {
				site_id: siteId,
			} )
		);
	}, [ dispatch, siteId ] );

	if ( ! hasFetchedLicensesCounts && ! userLicensesCounts ) {
		return (
			<div className="show-license-activation-link-if-available__container">
				<div
					className={ clsx( 'show-license-activation-link-if-available', {
						'is-placeholder': ! hasFetchedLicensesCounts,
					} ) }
				>
					{ isMobile ? (
						<span>Searching for any license keys...</span>
					) : (
						<span>Searching for unused product license keys...</span>
					) }
				</div>
			</div>
		);
	}

	if ( siteId && hasDetachedLicenses ) {
		return (
			<div className="show-license-activation-link-if-available__container">
				<div className="show-license-activation-link-if-available">
					{ isMobile ? (
						<a href={ jetpackDashboardUrl } onClick={ onLinkClick }>
							{ translate( 'Activate license' ) }
						</a>
					) : (
						<>
							<span>{ translate( 'Already have an existing plan or license key? ' ) }</span>
							<span className="licensing-activation-banner__activate">
								<a href={ jetpackDashboardUrl } onClick={ onLinkClick }>
									{ translate( 'Click here to get started' ) }
								</a>
							</span>
						</>
					) }
				</div>
			</div>
		);
	}

	return null;
}

export default ShowLicenseActivationLinkIfAvailable;
