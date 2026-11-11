import { DotcomPlans } from '@automattic/api-core';
import { useId, useRef, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { DifmOfferModalFrame, DifmOfferProgress } from './frame';
import { OfferStep } from './offer-step';
import { RequestStep } from './request-step';
import { DifmOfferReviews } from './reviews';
import type { DifmOfferVariation } from '../../utils/difm-offer';
import type { DifmOfferSource, Site } from '@automattic/api-core';

export { default as DifmOfferThankYouModal } from './thank-you-modal';
export { DIFM_OFFER_PURCHASED_SEARCH } from './request-step';

export interface DifmOfferModalProps {
	site: Pick< Site, 'ID' | 'slug' >;
	userEmail: string;
	variation: Exclude< DifmOfferVariation, 'control' >;
	source: DifmOfferSource;
	/**
	 * Where checkout returns on cancel. Defaults to the current dashboard page.
	 */
	cancelTo?: string;
	onClose: () => void;
}

export default function DifmOfferModal( {
	site,
	userEmail,
	variation,
	source,
	cancelTo,
	onClose,
}: DifmOfferModalProps ) {
	const { recordTracksEvent } = useAnalytics();
	const titleId = useId();
	const [ step, setStep ] = useState< 'offer' | 'request' >( 'offer' );
	// A ref, not state, because the close handler only reads it and nothing renders from it.
	const hasSentRequest = useRef( false );
	// A close during a pending request would drop the cart step, or redirect after the close.
	const [ isBusy, setIsBusy ] = useState( false );

	const tracksProps = {
		source,
		variation,
		upsell_id: 'difm-offer-modal',
		upsell_feature_id: 'difm-offer',
	};

	const handleClose = () => {
		if ( isBusy ) {
			return;
		}
		// Once the build request succeeds, the user has acted on the offer, even when the
		// cart step fails afterwards, so closing the modal is not a dismissal.
		if ( ! hasSentRequest.current ) {
			recordTracksEvent( 'calypso_dashboard_upsell_dismiss', { ...tracksProps, step } );
		}
		onClose();
	};

	const handleContinue = () => {
		recordTracksEvent( 'calypso_dashboard_upsell_click', { ...tracksProps, step: 'offer' } );
		setStep( 'request' );
	};

	// A separate event, so the FAQ click does not count as a CTA click in the upsell funnel.
	const handleHowItWorksClick = () => {
		recordTracksEvent( 'calypso_difm_offer_how_it_works_click', tracksProps );
	};

	return (
		<DifmOfferModalFrame
			labelledBy={ titleId }
			isBusy={ isBusy }
			headerStart={ <DifmOfferProgress step={ step === 'offer' ? 1 : 2 } /> }
			panel={
				step === 'request' ? (
					<DifmOfferReviews
						onReviewLinkClick={ ( review ) =>
							recordTracksEvent( 'calypso_difm_offer_review_click', {
								...tracksProps,
								review_id: review.id,
							} )
						}
					/>
				) : undefined
			}
			onRequestClose={ handleClose }
		>
			{ step === 'offer' ? (
				<OfferStep
					titleId={ titleId }
					tracksProps={ tracksProps }
					onContinue={ handleContinue }
					onHowItWorksClick={ handleHowItWorksClick }
				/>
			) : (
				<RequestStep
					titleId={ titleId }
					site={ site }
					userEmail={ userEmail }
					source={ source }
					variation={ variation }
					// The offer is for an annual Business plan.
					productSlug={ DotcomPlans.BUSINESS }
					cancelTo={ cancelTo }
					onSubmit={ () =>
						recordTracksEvent( 'calypso_dashboard_upsell_click', {
							...tracksProps,
							step: 'request',
						} )
					}
					onRequestSent={ () => {
						hasSentRequest.current = true;
					} }
					onBusyChange={ setIsBusy }
				/>
			) }
		</DifmOfferModalFrame>
	);
}
