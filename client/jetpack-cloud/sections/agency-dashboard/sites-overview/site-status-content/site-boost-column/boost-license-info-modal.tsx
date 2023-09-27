import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useContext, useEffect } from 'react';
import SitesOverviewContext from '../../context';
import useInstallBoost from '../../hooks/use-install-boost';
import LicenseInfoModal from '../../license-info-modal';

import './style.scss';

interface Props {
	onClose: () => void;
	siteId: number;
}

export default function BoostLicenseInfoModal( { onClose, siteId }: Props ) {
	const translate = useTranslate();

	const { filter, search, currentPage, sort } = useContext( SitesOverviewContext );

	const queryKey = [ 'jetpack-agency-dashboard-sites', search, currentPage, filter, sort ];

	const { installBoost, requestBoostScore, status } = useInstallBoost( siteId, queryKey );

	const handleInstallBoost = () => {
		installBoost();
	};

	const handlePurchaseBoost = () => {
		requestBoostScore();
	};

	const inProgress = status === 'progress';

	useEffect( () => {
		if ( status === 'success' ) {
			onClose();
		}
	}, [ status, onClose ] );

	return (
		<LicenseInfoModal
			currentLicenseInfo="boost"
			label={ translate( 'Purchase Boost License' ) }
			onClose={ onClose }
			siteId={ siteId }
			onCtaClick={ handlePurchaseBoost }
			extraContent={
				<Button
					disabled={ inProgress }
					className="site-boost-column__extra-button"
					onClick={ handleInstallBoost }
				>
					{ translate( 'Start Free' ) }
				</Button>
			}
			isDisabled={ inProgress }
		/>
	);
}
