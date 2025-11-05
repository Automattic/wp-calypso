import { Button } from '@wordpress/components';
import { Icon, download } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { ComponentProps, useState } from 'react';
import A4AThemedModal from 'calypso/a8c-for-agencies/components/a4a-themed-modal';
import AgencyTierLevels from 'calypso/assets/images/a8c-for-agencies/agency-tier/agency-tier-levels.svg';
import { preventWidows } from 'calypso/lib/formatting';
import { useSelector, useDispatch } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import DownloadLink from './download-link';

import './style.scss';

export default function DownloadBadges( {
	buttonProps = {},
}: {
	buttonProps?: ComponentProps< typeof Button >;
} ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const agency = useSelector( getActiveAgency );

	const partnerDirectories = agency?.partner_directory?.directories ?? [];

	const currentAgencyTier = agency?.tier?.id;

	const [ showDownloadModal, setShowDownloadModal ] = useState( false );

	const handleOnClose = () => {
		setShowDownloadModal( false );
		dispatch( recordTracksEvent( 'calypso_a8c_agency_tier_badges_download_modal_close' ) );
	};

	const handleDownloadBadgeClick = () => {
		setShowDownloadModal( true );
		dispatch( recordTracksEvent( 'calypso_a8c_agency_tier_badges_download_modal_open' ) );
	};

	if ( ! partnerDirectories.length || ! currentAgencyTier ) {
		return null;
	}

	return (
		<>
			<Button
				className="agency-tier-download-badge__button"
				variant="secondary"
				onClick={ handleDownloadBadgeClick }
				icon={ <Icon icon={ download } /> }
				iconPosition="right"
				iconSize={ 18 }
				{ ...buttonProps }
			>
				{ translate( 'Download your badges' ) }
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
							{ partnerDirectories.map( ( directory ) => (
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
