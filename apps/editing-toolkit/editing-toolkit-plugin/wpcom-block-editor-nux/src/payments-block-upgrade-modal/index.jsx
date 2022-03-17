import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import NuxModal from '../nux-modal';
import contentSubmittedImage from './images/plan-upgraded.svg';
import './style.scss';

/**
 * Show message after user has upgraded using the Payments Block
 */
const PaymentsBlockUpgradeModal = () => {
	const [ isModalOpen, setIsModalOpen ] = useState( false );

	useEffect( () => {
		const noticePattern = /[&?]notice=([\w_-]+)/;
		const match = noticePattern.exec( document.location.search );
		const notice = match && match[ 1 ];
		if ( 'purchase-success' === notice ) {
			setIsModalOpen( true );
		}
	}, [] );

	const closeModal = () => setIsModalOpen( false );

	return (
		<NuxModal
			isOpen={ isModalOpen }
			className="wpcom-site-editor-payments-block-upgrade-modal"
			title={ __( 'You have upgraded!!', 'full-site-editing' ) }
			description={ __( 'Now you can sell your products online.', 'full-site-editing' ) }
			imageSrc={ contentSubmittedImage }
			actionButtons={
				<>
					<Button onClick={ closeModal }>{ __( 'Continue editing', 'full-site-editing' ) }</Button>
				</>
			}
			onRequestClose={ closeModal }
			onOpen={ () =>
				recordTracksEvent( 'calypso_editor_wpcom_payments_block_upgraded_modal_show' )
			}
		/>
	);
};

export default PaymentsBlockUpgradeModal;
