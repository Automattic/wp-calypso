import { Button } from '@wordpress/components';
import { Icon, download } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import A4AThemedModal from 'calypso/a8c-for-agencies/components/a4a-themed-modal';
import AgencyTierLevels from 'calypso/assets/images/a8c-for-agencies/agency-tier/agency-tier-levels.svg';
import { preventWidows } from 'calypso/lib/formatting';
import { useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import DownloadLink from './download-link';

import './style.scss';

export default function DownloadBadges() {
	const translate = useTranslate();

	const agency = useSelector( getActiveAgency );

	const partnerDirectorties =
		agency?.profile?.partner_directory_application?.directories.map(
			( { directory } ) => directory
		) ?? [];

	const currentAgencyTier = agency?.tier?.id;

	const [ showDownloadModal, setShowDownloadModal ] = useState( false );

	const handleOnClose = () => {
		setShowDownloadModal( false );
	};

	if ( ! partnerDirectorties.length || ! currentAgencyTier ) {
		return null;
	}

	return (
		<>
			<Button
				className="agency-tier-download-badge__button"
				variant="secondary"
				onClick={ () => setShowDownloadModal( true ) }
			>
				{ translate( 'Download your badges' ) }
				<Icon icon={ download } size={ 18 } />
			</Button>
			{ showDownloadModal && (
				<A4AThemedModal
					className="agency-tier-download-badges-modal"
					modalImage={ AgencyTierLevels }
					onClose={ handleOnClose }
					dismissable
				>
					<div className="agency-tier-download-badges-modal__content">
						<div className="agency-tier-download-badges-modal__title">
							{ preventWidows( translate( 'Download your agency badges' ) ) }
						</div>
						<div className="agency-tier-download-badges-modal__description">
							{ preventWidows(
								translate(
									'Impress potential clients by displaying your expertise in Automattic products on your website and materials.'
								)
							) }
						</div>
						<div className="agency-tier-download-badges-modal__list-heading">
							{ translate( 'Available badges for download:' ) }
						</div>

						<div className="agency-tier-download-badges-modal__list">
							{ partnerDirectorties.map( ( directory ) => (
								<DownloadLink
									key={ directory }
									product={ directory }
									currentAgencyTier={ currentAgencyTier }
								/>
							) ) }
						</div>
					</div>
				</A4AThemedModal>
			) }
		</>
	);
}
