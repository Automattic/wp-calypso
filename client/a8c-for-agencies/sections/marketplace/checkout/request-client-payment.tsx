import { Button, FormLabel } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { ChangeEvent, useCallback, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextarea from 'calypso/components/forms/form-textarea';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

function RequestClientPayment() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ email, setEmail ] = useState( '' );
	const [ message, setMessage ] = useState( '' );

	const onEmailChange = useCallback( ( event: ChangeEvent< HTMLInputElement > ) => {
		setEmail( event.currentTarget.value );
	}, [] );

	const onMessageChange = useCallback( ( event: ChangeEvent< HTMLInputElement > ) => {
		setMessage( event.currentTarget.value );
	}, [] );

	const hasCompletedForm = !! email && !! message;

	const learnMoreLink = ''; //FIXME: Add link for A4A;

	const handleRequestPayment = useCallback( () => {
		if ( ! hasCompletedForm ) {
			return;
		}
		dispatch(
			recordTracksEvent( 'calypso_a4a_marketplace_referral_checkout_request_payment_click' )
		);
	}, [ dispatch, hasCompletedForm ] );

	const onClickLearnMore = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_marketplace_referral_checkout_learn_more_click' ) );
	}, [ dispatch ] );

	return (
		<>
			<div className="checkout__client-referral-form">
				<FormFieldset>
					<FormLabel htmlFor="email">{ translate( 'Client’s email address' ) }</FormLabel>
					<FormTextInput
						name="email"
						id="email"
						value={ email }
						onChange={ onEmailChange }
						onClick={ () =>
							dispatch( recordTracksEvent( 'calypso_a4a_client_referral_form_email_click' ) )
						}
					/>
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="message">{ translate( 'Custom message' ) }</FormLabel>
					<FormTextarea
						name="message"
						id="message"
						placeholder="Send a message to your client about this request for payment."
						value={ message }
						onChange={ onMessageChange }
						onClick={ () =>
							dispatch( recordTracksEvent( 'calypso_a4a_client_referral_form_message_click' ) )
						}
					/>
				</FormFieldset>
			</div>
			<div className="checkout__aside-actions">
				<Button primary onClick={ handleRequestPayment } disabled={ ! hasCompletedForm }>
					{ translate( 'Request payment from client' ) }
				</Button>
			</div>

			<div className="checkout__summary-notice margin-top">
				{ translate(
					'The client will be billed at the end of every month. The first month may be less than the above amount. {{a}}Learn more{{/a}}',
					{
						components: {
							a: (
								<a
									href={ learnMoreLink }
									target="_blank"
									rel="noopener noreferrer"
									onClick={ onClickLearnMore }
								/>
							),
						},
					}
				) }
			</div>
		</>
	);
}

export default RequestClientPayment;
