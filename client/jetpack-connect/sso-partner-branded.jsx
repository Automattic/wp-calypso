import { Step } from '@automattic/onboarding';
import { speak } from '@wordpress/a11y';
import { Notice } from '@wordpress/ui';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { ActionButtons } from 'calypso/components/connect-screen/action-buttons';
import { BrandHeader } from 'calypso/components/connect-screen/brand-header';
import { UserCard } from 'calypso/components/connect-screen/user-card';
import wpcom from 'calypso/lib/wp';

export default function SsoPartnerBranded( {
	partnerConfig,
	title,
	subtitle,
	currentUser,
	errorNotice,
	isPrimaryDisabled,
	isPrimaryLoading,
	onApproveClick,
	onReturnToSiteClick,
	onSignInDifferentUserClick,
	approveLabel,
	returnToSiteLabel,
	signInDifferentUserLabel,
} ) {
	const translate = useTranslate();
	const [ isSendingVerificationEmail, setIsSendingVerificationEmail ] = useState( false );
	const [ verificationEmailSent, setVerificationEmailSent ] = useState( false );
	const [ verificationEmailError, setVerificationEmailError ] = useState( null );

	const isEmailVerified = Boolean( currentUser?.email_verified );

	const sendingTitle = translate( 'Sending…' );

	const errorTitle = translate( 'The email could not be sent.' );

	const successDescription = translate( 'We sent another confirmation email to %(email)s.', {
		args: {
			email: currentUser?.email,
		},
	} );

	const defaultDescription = translate(
		'You must verify your email to sign in with WordPress.com.'
	);

	// @wordpress/ui's Notice doesn't announce itself, so announce the current message.
	const spokenVerificationMessage = isSendingVerificationEmail
		? sendingTitle
		: ( verificationEmailError && errorTitle ) ||
			( verificationEmailSent && successDescription ) ||
			defaultDescription;

	useEffect( () => {
		if ( ! isEmailVerified ) {
			speak( spokenVerificationMessage, 'polite' );
		}
	}, [ isEmailVerified, spokenVerificationMessage ] );

	const sendVerificationEmail = ( event ) => {
		event?.preventDefault?.();

		if ( isSendingVerificationEmail ) {
			return;
		}

		setIsSendingVerificationEmail( true );
		setVerificationEmailSent( false );
		setVerificationEmailError( null );

		wpcom.req.post( '/me/send-verification-email', ( error, response ) => {
			setVerificationEmailSent( Boolean( response?.success ) );
			setVerificationEmailError( error );
			setIsSendingVerificationEmail( false );
		} );
	};

	const renderEmailVerificationNotice = () => {
		if ( isSendingVerificationEmail ) {
			return (
				<Notice.Root intent="info" className="jetpack-connect__sso-partner-branded-email-notice">
					<Notice.Title>{ sendingTitle }</Notice.Title>
				</Notice.Root>
			);
		}

		if ( verificationEmailError ) {
			return (
				<Notice.Root intent="warning" className="jetpack-connect__sso-partner-branded-email-notice">
					<Notice.Title>{ errorTitle }</Notice.Title>
					<Notice.Actions>
						<Notice.ActionButton onClick={ sendVerificationEmail }>
							{ translate( 'Try again' ) }
						</Notice.ActionButton>
					</Notice.Actions>
				</Notice.Root>
			);
		}

		if ( verificationEmailSent ) {
			return (
				<Notice.Root intent="success" className="jetpack-connect__sso-partner-branded-email-notice">
					<Notice.Description>{ successDescription }</Notice.Description>
				</Notice.Root>
			);
		}

		return (
			<Notice.Root intent="info" className="jetpack-connect__sso-partner-branded-email-notice">
				<Notice.Description>{ defaultDescription }</Notice.Description>
				<Notice.Actions>
					<Notice.ActionButton onClick={ sendVerificationEmail }>
						{ translate( 'Resend Email' ) }
					</Notice.ActionButton>
				</Notice.Actions>
			</Notice.Root>
		);
	};

	const topBarLogoConfig = partnerConfig?.compactLogo ?? partnerConfig?.logo;
	const topBarLogo = topBarLogoConfig?.src ? (
		<img
			src={ topBarLogoConfig.src }
			alt={ topBarLogoConfig.alt }
			width={ topBarLogoConfig.width }
			height={ topBarLogoConfig.height }
		/>
	) : undefined;

	return (
		<Step.CenteredColumnLayout
			columnWidth={ 4 }
			verticalAlign="center"
			topBar={ <Step.TopBar logo={ topBarLogo } /> }
		>
			<div
				className={ `jetpack-connect__sso-partner-branded jetpack-connect__sso-partner-branded--${ partnerConfig.id }` }
			>
				<BrandHeader title={ title } description={ subtitle } />

				<div className="jetpack-connect__sso-partner-branded-logged-in">
					{ errorNotice }
					{ ! isEmailVerified && renderEmailVerificationNotice() }
					<UserCard
						className="jetpack-connect__sso-partner-branded-user-card"
						size="large"
						user={ {
							displayName: currentUser.display_name,
							email: currentUser.email,
							avatarUrl: currentUser.avatar_URL,
						} }
					/>
					<ActionButtons
						className="jetpack-connect__sso-partner-branded-actions"
						primaryClassName="jetpack-connect__sso-partner-branded-primary-button"
						primaryLabel={ approveLabel }
						primaryOnClick={ onApproveClick }
						primaryLoading={ isPrimaryLoading }
						primaryDisabled={ isPrimaryDisabled || ! isEmailVerified }
						secondaryClassName="jetpack-connect__sso-partner-branded-secondary-button"
						secondaryLabel={ returnToSiteLabel }
						secondaryOnClick={ onReturnToSiteClick }
						tertiaryLabel={ signInDifferentUserLabel }
						tertiaryOnClick={ onSignInDifferentUserClick }
					/>
				</div>
			</div>
		</Step.CenteredColumnLayout>
	);
}

SsoPartnerBranded.propTypes = {
	partnerConfig: PropTypes.shape( {
		id: PropTypes.string.isRequired,
		logo: PropTypes.shape( {
			src: PropTypes.string,
			alt: PropTypes.string,
			width: PropTypes.number,
			height: PropTypes.number,
		} ),
		compactLogo: PropTypes.shape( {
			src: PropTypes.string,
			alt: PropTypes.string,
			width: PropTypes.number,
			height: PropTypes.number,
		} ),
	} ).isRequired,
	title: PropTypes.node.isRequired,
	subtitle: PropTypes.node,
	currentUser: PropTypes.shape( {
		display_name: PropTypes.string,
		email: PropTypes.string,
		avatar_URL: PropTypes.string,
		email_verified: PropTypes.bool,
	} ).isRequired,
	errorNotice: PropTypes.node,
	isPrimaryDisabled: PropTypes.bool,
	isPrimaryLoading: PropTypes.bool,
	onApproveClick: PropTypes.func.isRequired,
	onReturnToSiteClick: PropTypes.func.isRequired,
	onSignInDifferentUserClick: PropTypes.func.isRequired,
	approveLabel: PropTypes.node.isRequired,
	returnToSiteLabel: PropTypes.node.isRequired,
	signInDifferentUserLabel: PropTypes.node.isRequired,
};
