import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { getUserLicensesCounts } from 'calypso/state/user-licensing/selectors';
import keyIcon from './key-icon.svg';

import './style.scss';

interface Props {
	siteId: number;
}

function LicensingActivationBanner( { siteId }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const siteAdminUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId ) );
	const jetpackDashboardUrl = siteAdminUrl + 'admin.php?page=jetpack#/license/activation';
	const userLicensesCounts = useSelector( getUserLicensesCounts );
	const hasDetachedLicenses = userLicensesCounts && userLicensesCounts[ 'detached' ] !== 0;

	useEffect( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_licensing_activation_banner_render', { site_id: siteId } )
		);
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	const onLinkClick = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_licensing_activation_banner_clicked', {
				site_id: siteId,
			} )
		);
	}, [ dispatch, siteId ] );

	if ( hasDetachedLicenses ) {
		return (
			<>
				<div className="licensing-activation-banner">
					<img className="licensing-activation-banner__key-icon" src={ keyIcon } alt="" />
					{ translate( 'You have an available product license key.' ) }
					<span className="licensing-activation-banner__activate">
						<a href={ jetpackDashboardUrl } onClick={ onLinkClick }>
							{ translate( 'Activate it now' ) }
						</a>
					</span>
				</div>
			</>
		);
	}

	return null;
}

export default LicensingActivationBanner;
