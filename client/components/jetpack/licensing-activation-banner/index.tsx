import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { getUserLicensesCounts } from 'calypso/state/user-licensing/selectors';
import keyIcon from './key-icon.svg';

import './style.scss';

interface Props {
	siteId: number;
}

function LicensingActivationBanner( { siteId }: Props ) {
	const translate = useTranslate();
	const siteAdminUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId ) );
	const jetpackDashboardUrl = siteAdminUrl + 'admin.php?page=jetpack#/license/activation';
	const userLicensesCounts = useSelector( getUserLicensesCounts );
	const hasDetachedLicenses = userLicensesCounts && userLicensesCounts[ 'detached' ] !== 0;

	if ( hasDetachedLicenses ) {
		return (
			<>
				<div className="licensing-activation-banner">
					<img className="licensing-activation-banner__key-icon" src={ keyIcon } alt="" />
					{ translate( 'You have an available product license key.' ) }
					<span className="licensing-activation-banner__activate">
						<a href={ jetpackDashboardUrl }>{ translate( 'Activate it now' ) }</a>
					</span>
				</div>
			</>
		);
	}

	return null;
}

export default LicensingActivationBanner;
