import { Button } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { connectDomainAction } from 'calypso/components/domains/use-my-domain/utilities';
import wpcom from 'calypso/lib/wp';
import { Input } from 'calypso/my-sites/domains/components/form';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import ConnectDomainStepWrapper from './connect-domain-step-wrapper';
import { modeType, stepsHeadingAdvanced, stepsHeadingSuggested, stepSlug } from './constants';

import './style.scss';

function ConnectDomainStepLogin( {
	className,
	defaultConnectHandler,
	domain,
	mode,
	onConnect,
	pageSlug,
	progressStepList,
	recordMappingButtonClickInUseYourDomain,
	selectedSite,
} ) {
	const { __ } = useI18n();
	const [ authCode, setAuthCode ] = useState( '' );
	const [ authCodeCheckInProgress, setAuthCodeCheckInProgress ] = useState( false );
	const [ connectInProgress, setConnectInProgress ] = useState( false );
	const [ authCodeError, setAuthCodeError ] = useState( null );

	const handleConnect = () => {
		recordMappingButtonClickInUseYourDomain( domain );
		setConnectInProgress( true );

		const connectHandler = onConnect ?? defaultConnectHandler;
		connectHandler( { domain, selectedSite }, () => setConnectInProgress( false ) );
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

		setAuthCodeCheckInProgress( true );
		setAuthCodeError( null );

		wpcom
			.domains()
			.authCodeCheck( domain, authCode )
			.then( ( result ) => {
				if ( true === result.success ) {
					handleConnect();
				} else {
					setAuthCodeError(
						__( 'Sorry, that authorization code is incorrect. Please try again.' )
					);
				}
			} )
			.catch( ( error ) => setAuthCodeError( error.message ) )
			.finally( () => setAuthCodeCheckInProgress( false ) );
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
					'A domain authorization code is a unique code linked only to your domain, it might also be called a secret code, auth code, or EPP code. You can usually find this in your domain settings page.'
				) }
			</p>
			<div className={ className + '__authorization-code' }>
				<Input
					placeholder={ __( 'Enter your authorization code' ) }
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
				busy={ authCodeCheckInProgress || connectInProgress }
				disabled={ authCodeCheckInProgress || connectInProgress }
				onClick={ checkAuthCode }
				primary
			>
				{ __( 'Check authorization code' ) }
			</Button>
		</div>
	);

	const heading = modeType.SUGGESTED === mode ? stepsHeadingSuggested : stepsHeadingAdvanced;

	return (
		<ConnectDomainStepWrapper
			className={ className }
			heading={ heading }
			mode={ mode }
			progressStepList={ progressStepList }
			pageSlug={ pageSlug }
			stepContent={ stepContent }
		/>
	);
}

const recordMappingButtonClickInUseYourDomain = ( domain_name ) =>
	recordTracksEvent( 'calypso_use_your_domain_mapping_click', { domain_name } );

export default connect( ( state ) => ( { selectedSite: getSelectedSite( state ) } ), {
	defaultConnectHandler: connectDomainAction,
	recordMappingButtonClickInUseYourDomain,
} )( localize( ConnectDomainStepLogin ) );

ConnectDomainStepLogin.propTypes = {
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
