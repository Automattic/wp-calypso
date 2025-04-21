import { FormLabel } from '@automattic/components';
import { Button, CheckboxControl } from '@wordpress/components';
import { Icon, external, info } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import A4AModal from 'calypso/a8c-for-agencies/components/a4a-modal';
import {
	isWPCOMHostingProduct,
	isPressableHostingProduct,
} from 'calypso/a8c-for-agencies/sections/marketplace/lib/hosting';
import useRefetchLicenses from 'calypso/a8c-for-agencies/sections/purchases/licenses/hooks/use-refetch-licenses';
import LicensesOverviewContext from 'calypso/a8c-for-agencies/sections/purchases/licenses/licenses-overview/context';
import useRevokeLicenseMutation from 'calypso/a8c-for-agencies/sections/purchases/licenses/revoke-license-dialog/hooks/use-revoke-license-mutation';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextarea from 'calypso/components/forms/form-textarea';
import { urlToSlug } from 'calypso/lib/url/http-utils';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { successNotice } from 'calypso/state/notices/actions';
import useSaveFeedbackMutation from '../hooks/use-save-feedback-mutation';
import { getA4AfeedbackProps } from '../lib/get-a4a-feedback-props';
import { FeedbackType, type FeedbackSuggestion } from '../types';
import HostingPlanDetails from './hosting-plan-details';

import './style.scss';

const CancelLicenseFeedbackModal = ( {
	onClose,
	productName,
	licenseKey,
	productId,
	bundleSize,
	siteUrl,
	isAtomicSite,
	isClientLicense,
}: {
	onClose: () => void;
	productName: string;
	licenseKey: string;
	productId?: number;
	bundleSize?: number;
	siteUrl?: string | null;
	isAtomicSite?: boolean;
	isClientLicense?: boolean;
} ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const siteSlug = siteUrl ? urlToSlug( siteUrl ) : null;

	const refreshLicenceList = useRefetchLicenses( LicensesOverviewContext );

	const [ comments, setComments ] = useState< string >( '' );
	const [ suggestions, setSuggestions ] = useState< FeedbackSuggestion[] >( [] );
	const [ selectedCTA, setSelectedCTA ] = useState< 'cancel' | 'speak-with-partner-manager' >();

	const onSuggestionChange = ( option: FeedbackSuggestion ) => {
		if ( suggestions.find( ( suggestion ) => suggestion.value === option.value ) ) {
			setSuggestions( ( prev ) =>
				prev.filter( ( suggestion ) => suggestion.value !== option.value )
			);
		} else {
			setSuggestions( ( prev ) => [ ...prev, option ] );
		}
	};

	const { suggestion } = getA4AfeedbackProps( FeedbackType.LicenseCancelProduct, translate, {
		productName,
	} );

	const isPressableLicense = isPressableHostingProduct( licenseKey );
	const isWPCOMHostingLicense = isWPCOMHostingProduct( licenseKey );

	const isHostingLicense = isPressableLicense || isWPCOMHostingLicense;

	const type: FeedbackType = isHostingLicense
		? FeedbackType.LicenseCancelHosting
		: FeedbackType.LicenseCancelProduct;

	const agencyId = useSelector( getActiveAgencyId );

	const {
		mutate: saveFeedback,
		status: saveFeedbackStatus,
		isPending: isSavingFeedback,
	} = useSaveFeedbackMutation();

	const {
		mutate: revokeLicense,
		isPending: isRevokingLicense,
		status: revokeLicenseStatus,
	} = useRevokeLicenseMutation();

	const isLoading = isRevokingLicense || isSavingFeedback;

	// If the user clicks cancel and provides feedback, the feedback is valid
	// If the user clicks cancel and does not provide feedback, the feedback is not valid
	// If the user clicks speak with partner manager and provides feedback, the feedback is valid
	// If the user clicks speak with partner manager and does not provide feedback, the feedback is valid
	const isFeedbackValid = useCallback(
		( cta: 'cancel' | 'speak-with-partner-manager' ) => {
			if ( cta === 'cancel' ) {
				return comments || suggestions.length;
			}
			return true;
		},
		[ comments, suggestions ]
	);

	const handleSubmitFeedback = ( cta: 'cancel' | 'speak-with-partner-manager' ) => {
		if ( agencyId && isFeedbackValid( cta ) ) {
			const params = {
				site_id: agencyId,
				survey_id: type,
				survey_responses: {
					comment: { text: comments },
					suggestions: {
						text: suggestions?.map( ( suggestion ) => suggestion.value ).join( ', ' ) ?? '',
					},
					cta,
					meta: {
						product_name: productName,
						license_key: licenseKey,
						license_type: isClientLicense ? 'client' : 'agency',
					},
				},
			};
			dispatch(
				recordTracksEvent( 'calypso_a4a_churn_feedback_submit', {
					agency_id: agencyId,
					survey_id: params.survey_id,
					comment: params.survey_responses.comment.text,
					suggestions: params.survey_responses.suggestions.text,
					cta: params.survey_responses.cta,
					product: params.survey_responses.meta.product_name,
					type: params.survey_responses.meta.license_type,
				} )
			);

			saveFeedback( { params } );
		}
	};

	const handleCTAClick = ( cta: 'cancel' | 'speak-with-partner-manager' ) => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_churn_feedback_cta_click', {
				agency_id: agencyId,
				survey_id: type,
				cta,
			} )
		);
		setSelectedCTA( cta );
		if ( cta === 'cancel' ) {
			if ( isAtomicSite ) {
				window.open( `https://wordpress.com/purchases/subscriptions/${ siteSlug }`, '_blank' );
			} else {
				revokeLicense( {
					licenseKey,
				} );
			}
		}
		handleSubmitFeedback( cta );
	};

	const handleCloseAndRefreshLicences = useCallback( () => {
		refreshLicenceList();
		onClose();
	}, [ refreshLicenceList, onClose ] );

	// Function to handle success notice for license revocation
	const handleLicenseRevocationSuccess = useCallback( () => {
		dispatch(
			successNotice( translate( 'License revoked successfully' ), {
				displayOnNextPage: true,
				id: 'revoke-license-success',
				duration: 10000,
			} )
		);
		if ( ! isFeedbackValid( 'cancel' ) ) {
			handleCloseAndRefreshLicences();
		}
	}, [ dispatch, translate, isFeedbackValid, handleCloseAndRefreshLicences ] );

	// Function to handle success notice for speaking with partner manager
	const handlePartnerManagerSuccess = useCallback( () => {
		dispatch(
			successNotice( translate( 'Thanks! We will connect you with your partner manager.' ), {
				displayOnNextPage: true,
				id: 'submit-product-feedback-success',
				duration: 10000,
			} )
		);
		onClose();
	}, [ dispatch, onClose, translate ] );

	useEffect( () => {
		if ( selectedCTA === 'cancel' && revokeLicenseStatus === 'success' ) {
			handleLicenseRevocationSuccess();
		}
		if ( selectedCTA === 'speak-with-partner-manager' && saveFeedbackStatus === 'success' ) {
			handlePartnerManagerSuccess();
		}
		if (
			( revokeLicenseStatus === 'success' || isAtomicSite ) &&
			saveFeedbackStatus === 'success'
		) {
			handleCloseAndRefreshLicences();
		}
	}, [
		handleCloseAndRefreshLicences,
		handleLicenseRevocationSuccess,
		handlePartnerManagerSuccess,
		isAtomicSite,
		revokeLicenseStatus,
		saveFeedbackStatus,
		selectedCTA,
	] );

	return (
		<A4AModal
			title={ translate( 'Are you sure you want to revoke this license?' ) }
			subtile={ translate(
				'A revoked license cannot be reused, and the associated site will no longer have access to the provisioned product. You will stop being billed for this license immediately.'
			) }
			onClose={ onClose }
			showCloseButton={ false }
			extraActions={
				<>
					<Button
						isDestructive
						onClick={ () => handleCTAClick( 'cancel' ) }
						variant="secondary"
						disabled={ isLoading }
						isBusy={ selectedCTA === 'cancel' && isLoading }
					>
						{ translate( 'Cancel license' ) }
						{ isAtomicSite && <Icon icon={ external } size={ 18 } /> }
					</Button>
					<Button
						onClick={ () => handleCTAClick( 'speak-with-partner-manager' ) }
						variant="primary"
						disabled={ isLoading }
						isBusy={ selectedCTA === 'speak-with-partner-manager' && isLoading }
					>
						{ translate( 'Speak with my Partner Manager' ) }
					</Button>
				</>
			}
		>
			<div className="a4a-feedback__churn-mechanism">
				<div className="a4a-feedback__license-details">
					{ siteUrl && (
						<div className="a4a-feedback__license-details-item">
							<div className="a4a-feedback__license-details-item-label">
								{ translate( 'Site:' ) }
							</div>
							<div className="a4a-feedback__license-details-item-label">
								{ isPressableLicense ? translate( 'Multiple sites use this license' ) : siteSlug }
							</div>
						</div>
					) }
					<div className="a4a-feedback__license-details-item">
						<div className="a4a-feedback__license-details-item-label">
							{ translate( 'Product:' ) }
						</div>
						<div className="a4a-feedback__license-details-item-value">
							{ productName }
							{ bundleSize && (
								<>
									{ translate( ' (%(bundleSize)d licenses)', {
										args: { bundleSize },
									} ) }
								</>
							) }
						</div>
					</div>
					<div className="a4a-feedback__license-details-item">
						<div className="a4a-feedback__license-details-item-label">
							{ translate( 'License:' ) }
						</div>
						<div className="a4a-feedback__license-details-item-value">{ licenseKey }</div>
					</div>
					<div className="a4a-feedback__license-details-warning">
						<Icon icon={ info } size={ 24 } />
						{ translate( 'Please note this action cannot be undone.' ) }
					</div>
				</div>

				{ suggestion && ! isHostingLicense && (
					<FormFieldset>
						<FormLabel className="a4a-feedback__comments-label" htmlFor="suggestion">
							{ suggestion.label }
						</FormLabel>
						<div className="a4a-feedback__suggestions">
							{ suggestion.options.map( ( option ) => (
								<CheckboxControl
									key={ `suggestion-${ option.value }` }
									label={ option.label }
									checked={ suggestions.some(
										( suggestion ) => suggestion.value === option.value
									) }
									onChange={ () => onSuggestionChange( option ) }
									disabled={ isLoading }
								/>
							) ) }
						</div>
					</FormFieldset>
				) }
				<FormFieldset>
					<FormLabel className="a4a-feedback__comments-label" htmlFor="comments">
						{ isHostingLicense
							? translate( "Can you tell us why you're canceling the %(productName)s plan?", {
									args: { productName },
							  } )
							: translate( 'Anything else we should know?' ) }
					</FormLabel>
					<FormTextarea
						className="a4a-feedback__comments"
						name="comments"
						id="comments"
						placeholder={
							isHostingLicense
								? translate( 'Enter your reason' )
								: translate( 'Enter the issues you encountered' )
						}
						value={ comments }
						onChange={ ( event: ChangeEvent< HTMLInputElement > ) =>
							setComments( event.target.value )
						}
						disabled={ isLoading }
					/>
				</FormFieldset>
				{ isHostingLicense && (
					<HostingPlanDetails
						productId={ productId }
						isPressableLicense={ isPressableLicense }
						isWPCOMHostingLicense={ isWPCOMHostingLicense }
					/>
				) }
			</div>
		</A4AModal>
	);
};

export default CancelLicenseFeedbackModal;
