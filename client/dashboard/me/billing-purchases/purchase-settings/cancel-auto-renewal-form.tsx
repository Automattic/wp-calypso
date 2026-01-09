import { marketingSurveyMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { RadioControl, __experimentalConfirmDialog as ConfirmDialog } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import { SectionHeader } from '../../../components/section-header';
import { shuffleArray } from '../../../utils/collection';
import enrichedSurveyData from '../cancel-purchase/enriched-survey-data';
import PrecancellationChatButton from './precancellation-chat-button';
import type { MarketingSurveyDetails, Purchase } from '@automattic/api-core';
import type { FC } from 'react';

interface CancelAutoRenewFormProps {
	purchase: Purchase;
	selectedSiteId: number;
	isVisible: boolean;
	onClose: () => void;
}

const CancelAutoRenewalForm: FC< CancelAutoRenewFormProps > = ( {
	purchase,
	selectedSiteId,
	isVisible,
	onClose,
} ) => {
	const getProductTypeString = () => {
		if ( purchase.is_domain_registration ) {
			/* translators: as in "domain name"*/
			return __( 'domain' );
		}

		if ( purchase.is_plan ) {
			/* translators: as in "Premium plan" or "Personal plan"*/
			return __( 'plan' );
		}

		return __( 'subscription' );
	};

	const productType = getProductTypeString();

	const [ state, setState ] = useState( {
		response: '',
		radioButtons: shuffleArray( [
			{
				value: 'let-it-expire',
				/* translators: %(productType)s will be either "plan", "domain", or "subscription". */
				label: sprintf( __( "I'm going to let this %(productType)s expire." ), {
					productType,
				} ),
			},
			{
				value: 'manual-renew',
				/* translators: %(productType)s will be either "plan", "domain", or "subscription". */
				label: sprintf( __( "I'm going to renew the %(productType)s, but will do it manually." ), {
					productType,
				} ),
			},
			{
				value: 'not-sure',
				label: __( "I'm not sure." ),
			},
		] ),
	} );

	const { radioButtons } = state;

	const marketingSurveyMutate = useMutation( marketingSurveyMutation() );
	const submitMarketingSurvey = ( surveyDetails: MarketingSurveyDetails ) =>
		marketingSurveyMutate.mutate( surveyDetails, {
			onSuccess: () => {
				setState( ( state ) => ( {
					...state,
					isSubmitting: false,
				} ) );
			},
			onError: () => {
				setState( ( state ) => ( {
					...state,
					isSubmitting: false,
				} ) );
			},
		} );

	const onSubmit = () => {
		const { response } = state;

		const surveyData = {
			response,
		};

		submitMarketingSurvey( {
			survey_id: 'calypso-cancel-auto-renewal',
			site_id: selectedSiteId,
			survey_responses: enrichedSurveyData( surveyData, purchase ),
		} );

		onClose();
	};

	const onRadioChange = ( value: string ) => {
		setState( ( state ) => ( {
			...state,
			response: value,
		} ) );
	};

	// render
	if ( ! isVisible ) {
		return null;
	}

	return (
		<ConfirmDialog
			onCancel={ onClose }
			onConfirm={ onSubmit }
			cancelButtonText={ __( 'Skip' ) }
			confirmButtonText={ __( 'Submit' ) }
		>
			<SectionHeader
				title={ __( 'Help us improve' ) }
				description={
					<>
						<fieldset role="group" style={ { border: 0 } }>
							<p>{ __( "You've turned off auto-renewal." ) }</p>
							<p>
								{ sprintf(
									/* translators: %(productType)s will be either "plan", "domain", or "subscription". */
									__(
										"Before you go, we'd love to know: " +
											"are you letting this %(productType)s expire completely, or do you think you'll renew it manually?"
									),
									{ productType }
								) }
							</p>
							<RadioControl
								className="cancel-auto-renewal-form__radio-control"
								hideLabelFromVision
								options={ radioButtons }
								selected={ state.response }
								onChange={ onRadioChange }
							/>
						</fieldset>
					</>
				}
				actions={
					<PrecancellationChatButton
						purchase={ purchase }
						onClick={ onClose }
						className="cancel-auto-renewal-form__chat-button"
					/>
				}
			/>
		</ConfirmDialog>
	);
};

export default CancelAutoRenewalForm;
