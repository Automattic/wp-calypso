import { Button } from '@wordpress/components';
import { Icon, download } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import A4AThemedModal from 'calypso/a8c-for-agencies/components/a4a-themed-modal';
import ThemeImage from 'calypso/assets/images/a8c-for-agencies/agency-tier/agency-tier-theme-modal-image.svg';

import './style.scss';

export default function DownloadBadges() {
	const translate = useTranslate();

	const [ showDownloadModal, setShowDownloadModal ] = useState( false );

	const handleOnClose = () => {
		setShowDownloadModal( false );
	};

	return (
		<>
			<Button variant="secondary" onClick={ () => setShowDownloadModal( true ) }>
				{ translate( 'Download your badges' ) }
				<Icon icon={ download } size={ 18 } />
			</Button>
			{ showDownloadModal && (
				<A4AThemedModal
					className="agency-tier-download-badges-modal"
					modalImage={ ThemeImage }
					onClose={ handleOnClose }
					dismissable
				>
					<div className="agency-tier-download-badges-modal__content">
						<div className="agency-tier-download-badges-modal__title">
							{ translate( 'Download your agency badges' ) }
						</div>
						<div className="agency-tier-download-badges-modal__description">
							{ translate(
								'Impress potential clients by displaying your expertise in Automattic products on your website and materials.'
							) }
						</div>
						<div className="agency-tier-download-badges-modal__list-heading">
							{ translate( 'Available badges for download:' ) }
						</div>

						<ul className="agency-tier-download-badges-modal__list"></ul>
					</div>
				</A4AThemedModal>
			) }
		</>
	);
}
