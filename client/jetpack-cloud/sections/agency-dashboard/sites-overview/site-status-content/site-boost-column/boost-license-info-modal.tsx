import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import LicenseInfoModal from '../../license-info-modal';

import './style.scss';

interface Props {
	onClose: () => void;
	siteId: number;
}

export default function BoostLicenseInfoModal( { onClose, siteId }: Props ) {
	const translate = useTranslate();

	const handleOnClick = () => {
		// Update handle click
	};

	return (
		<LicenseInfoModal
			currentLicenseInfo="boost"
			label={ translate( 'Purchase Boost License' ) }
			onClose={ onClose }
			siteId={ siteId }
			extraContent={
				<Button className="site-boost-column__extra-button" onClick={ handleOnClick }>
					{ translate( 'Generate one-time score' ) }
				</Button>
			}
		/>
	);
}
