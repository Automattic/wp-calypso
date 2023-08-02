import { Button, FormInputValidation } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { createElement, createInterpolateElement, useState } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import FormattedHeader from 'calypso/components/formatted-header';
import { useSendEmailVerification } from 'calypso/landing/stepper/hooks/use-send-email-verification';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { UserData } from 'calypso/lib/user/user';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { redirect } from '../import/util';
import type { Step } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';
import './style.scss';

const WooVerifyEmail: Step = function WooVerifyEmail( { navigation } ) {
	const { goBack, submit } = navigation;
	const { __ } = useI18n();
	const user = useSelector( getCurrentUser ) as UserData;
	const defaultButtonState = {
		status: 'default',
		buttonText: __( 'Resend verification email' ),
	};
	const [ buttonState, setButtonState ] = useState( defaultButtonState );
	const [ error, setError ] = useState( '' );
	const sendEmail = useSendEmailVerification();
	const { setEditEmail } = useDispatch( ONBOARD_STORE );
	const editEmail = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getEditEmail(),
		[]
	);

	const sendVerification = async () => {
		setEditEmail( '' );
		setButtonState( { status: 'processing', buttonText: __( 'Sending…' ) } );
		sendEmail()
			.then( () => {
				setButtonState( { status: 'success', buttonText: __( 'Request sent!' ) } );
				setTimeout( () => setButtonState( defaultButtonState ), 3000 );
			} )
			.catch( () => {
				setError( __( 'There was an error processing your request.' ) );
				setButtonState( defaultButtonState );
			} );
	};

	function getContent() {
		return (
			<div className="woo-verify-email__content">
				<Button
					className="woo-verify-email__button"
					busy={ buttonState.status === 'processing' }
					primary
					onClick={ ( e: React.MouseEvent< HTMLButtonElement > ) => {
						e.preventDefault();
						sendVerification();
					} }
				>
					{ buttonState.buttonText }
				</Button>
				{ error && (
					<FormInputValidation className="woo-verify-email__error-notice" isError text={ error } />
				) }
				<Button
					className="woo-verify-email__link"
					borderless
					onClick={ ( e: React.MouseEvent< HTMLButtonElement > ) => {
						e.preventDefault();
						submit?.( {}, 'edit-email' );
					} }
				>
					{ __( 'Edit email address' ) }
				</Button>
			</div>
		);
	}

	const userName = user.display_name;
	const userEmail = user.email;

	const headerText = createInterpolateElement(
		/* translators: the userName is the display name of the user, eg: Valter */
		sprintf( __( "You're all set %(userName)s! <br />We just need to verify your email." ), {
			userName,
		} ),
		{ br: createElement( 'br' ) }
	);

	const subHeaderText = createInterpolateElement(
		sprintf(
			/* translators: the userEmail is the email of the user */
			__(
				'A verification email has been sent to %(userEmail)s. <br />Please continue your journey from the link sent.'
			),
			{ userEmail: editEmail.length > 0 ? editEmail : userEmail }
		),
		{ br: createElement( 'br' ) }
	);

	const siteSlug = useSiteSlugParam();

	return (
		<StepContainer
			stepName="woo-verify-email-step"
			goBack={ goBack }
			goNext={ () => redirect( `/home/${ siteSlug }` ) }
			isHorizontalLayout={ false }
			skipButtonAlign="top"
			skipLabelText={ __( 'Confirm my email later' ) }
			formattedHeader={
				<FormattedHeader
					id="woo-verify-email-title-header"
					headerText={ headerText }
					subHeaderText={ subHeaderText }
				/>
			}
			stepContent={ getContent() }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default WooVerifyEmail;
