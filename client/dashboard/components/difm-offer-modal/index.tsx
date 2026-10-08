import { Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useRef, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { DIFM_OFFER_TERM_PRODUCT_SLUGS, OfferStep, type DifmOfferTerm } from './offer-step';
import { RequestStep } from './request-step';
import type { DifmOfferVariation } from '../../utils/difm-offer';
import type { DifmOfferSource, Site } from '@automattic/api-core';

export interface DifmOfferModalProps {
	site: Site;
	variation: Exclude< DifmOfferVariation, 'control' >;
	source: DifmOfferSource;
	onClose: () => void;
}

export default function DifmOfferModal( {
	site,
	variation,
	source,
	onClose,
}: DifmOfferModalProps ) {
	const { recordTracksEvent } = useAnalytics();
	const [ step, setStep ] = useState< 'offer' | 'request' >( 'offer' );
	const [ term, setTerm ] = useState< DifmOfferTerm >( '1y' );
	// A ref, not state, because the close handler only reads it and nothing renders from it.
	const hasSentRequest = useRef( false );

	const tracksProps = {
		source,
		variation,
		upsell_id: 'difm-offer-modal',
		upsell_feature_id: 'difm-offer',
	};

	const handleClose = () => {
		// Once the build request is sent, the user has acted on the offer, even when the
		// cart step fails afterwards, so closing the modal is not a dismissal.
		if ( ! hasSentRequest.current ) {
			recordTracksEvent( 'calypso_dashboard_upsell_dismiss', tracksProps );
		}
		onClose();
	};

	const handleContinue = () => {
		recordTracksEvent( 'calypso_dashboard_upsell_click', { ...tracksProps, step: 'offer' } );
		setStep( 'request' );
	};

	return (
		<Modal
			title={ __( 'Let our experts build your site' ) }
			onRequestClose={ handleClose }
			size="medium"
		>
			{ step === 'offer' ? (
				<OfferStep
					term={ term }
					tracksProps={ tracksProps }
					onTermChange={ setTerm }
					onContinue={ handleContinue }
				/>
			) : (
				<RequestStep
					site={ site }
					source={ source }
					variation={ variation }
					productSlug={ DIFM_OFFER_TERM_PRODUCT_SLUGS[ term ] }
					onSubmit={ () =>
						recordTracksEvent( 'calypso_dashboard_upsell_click', {
							...tracksProps,
							step: 'request',
						} )
					}
					onRequestSent={ () => {
						hasSentRequest.current = true;
					} }
					onCancel={ handleClose }
				/>
			) }
		</Modal>
	);
}
