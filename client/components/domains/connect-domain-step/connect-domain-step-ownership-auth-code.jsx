import { Button } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { connectDomainAction } from 'calypso/components/domains/use-my-domain/utilities';
import { Input } from 'calypso/my-sites/domains/components/form';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import ConnectDomainStepWrapper from './connect-domain-step-wrapper';
import { modeType, stepsHeadingOwnershipVerification, stepSlug } from './constants';

import './style.scss';

const ConnectDomainStepOwnershipAuthCode = ( {
	className,
	defaultConnectHandler,
	domain,
	mode,
	onConnect,
	pageSlug,
	progressStepList,
	recordMappingButtonClickInUseYourDomain,
	selectedSite,
} ) => {
	const { __ } = useI18n();
	const [ authCode, setAuthCode ] = useState( '' );
	const [ connectInProgress, setConnectInProgress ] = useState( false );
	const [ authCodeError, setAuthCodeError ] = useState( null );

	const getVerificationData = () => {
		return {
			ownership_verification_data: {
				verification_type: 'auth_code',
				verification_data: authCode,
			},
		};
	};

	const handleConnect = () => {
		recordMappingButtonClickInUseYourDomain( domain );
		setConnectInProgress( true );

		const connectHandler = onConnect ?? defaultConnectHandler;
		connectHandler(
			{
				domain,
				selectedSite,
				verificationData: getVerificationData(),
			},
			( error ) => {
				if ( 'ownership_verification_failed' === error.error ) {
					setAuthCodeError( error.message );
				}
				setConnectInProgress( false );
			}
		);
	};

	const onAuthCodeChange = ( event ) => {
		setAuthCode( event?.target?.value );
		setAuthCodeError( null );
	};

	const checkAuthCode = () => {
		if ( 0 === authCode.length ) {
			setAuthCodeError( __( 'Please enter an authorization code.' ) );
			return;
		}

		setAuthCodeError( null );

		handleConnect();
	};

	const stepContent = (
		<div className={ className + '__login' }>
			<p className={ className + '__text' }>
				{ __(
					'We will use your domain authorization code to verify that you are the domain owner.'
				) }
			</p>
			<p className={ className + '__text' }>
				{ __(
					'A domain authorization code is a unique code linked only to your domain. It might also be called a secret code, auth code, or EPP code. You can obtain this code from your domain registrar (where the domain is currently registered).'
				) }
			</p>
			<div className={ className + '__authorization-code' }>
				<Input
					placeholder={ __( 'Enter authorization code' ) }
					onChange={ onAuthCodeChange }
					value={ authCode }
					isError={ !! authCodeError }
					errorMessage={ authCodeError }
				/>
			</div>
			<p className={ className + '__text' }>
				{ __(
					"Once you've entered the authorization code, click on the button below to proceed."
				) }
			</p>
			<Button
				busy={ connectInProgress }
				disabled={ connectInProgress }
				onClick={ checkAuthCode }
				primary
			>
				{ __( 'Check my authorization code' ) }
			</Button>
		</div>
	);

	return (
		<ConnectDomainStepWrapper
			className={ className }
			heading={ stepsHeadingOwnershipVerification }
			mode={ mode }
			progressStepList={ progressStepList }
			pageSlug={ pageSlug }
			stepContent={ stepContent }
		/>
	);
};

const recordMappingButtonClickInUseYourDomain = ( domain_name ) =>
	recordTracksEvent( 'calypso_use_your_domain_mapping_click', { domain_name } );

export default connect( ( state ) => ( { selectedSite: getSelectedSite( state ) } ), {
	defaultConnectHandler: connectDomainAction,
	recordMappingButtonClickInUseYourDomain,
} )( ConnectDomainStepOwnershipAuthCode );

ConnectDomainStepOwnershipAuthCode.propTypes = {
	className: PropTypes.string.isRequired,
	defaultConnectHandler: PropTypes.func,
	domain: PropTypes.string.isRequired,
	mode: PropTypes.oneOf( Object.values( modeType ) ).isRequired,
	onConnect: PropTypes.func,
	pageSlug: PropTypes.oneOf( Object.values( stepSlug ) ).isRequired,
	progressStepList: PropTypes.object.isRequired,
	recordMappingButtonClickInUseYourDomain: PropTypes.func.isRequired,
	selectedSite: PropTypes.object,
};
