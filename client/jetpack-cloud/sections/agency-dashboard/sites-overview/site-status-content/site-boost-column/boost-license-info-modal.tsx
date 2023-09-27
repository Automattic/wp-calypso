import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useContext, useEffect, useMemo } from 'react';
import SitesOverviewContext from '../../context';
import useInstallBoost from '../../hooks/use-install-boost';
import LicenseInfoModal from '../../license-info-modal';

import './style.scss';

interface Props {
	onClose: () => void;
	siteId: number;
	siteUrl: string;
}

export default function BoostLicenseInfoModal( { onClose, siteId, siteUrl }: Props ) {
	const translate = useTranslate();

	const { filter, search, currentPage, sort } = useContext( SitesOverviewContext );

	// queryKey is needed to optimistically update the site list
	const queryKey = useMemo(
		() => [ 'jetpack-agency-dashboard-sites', search, currentPage, filter, sort ],
		[ filter, search, currentPage, sort ]
	);
	const { installBoost, requestBoostScore, status } = useInstallBoost( siteId, siteUrl, queryKey );

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
