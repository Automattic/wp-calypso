import { Gridicon } from '@automattic/components';
import { BackButton } from '@automattic/onboarding';
import { __, sprintf } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import FormattedHeader from 'calypso/components/formatted-header';
import wpcom from 'calypso/lib/wp';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import UseMyDomainInput from './domain-input';
import DomainTransferOrConnect from './transfer-or-connect';
import { getAvailabilityErrorMessage, getDomainNameValidationErrorMessage } from './utilities';

import './style.scss';

function UseMyDomain( {
	goBack,
	initialQuery,
	isSignupStep,
	onConnect,
	onTransfer,
	selectedSite,
	transferDomainUrl,
} ) {
	const inputMode = {
		domainInput: 'domain-input',
		transferOrConnect: 'transfer-or-connect',
	};

	const [ domainAvailabilityData, setDomainAvailabilityData ] = useState( {} );
	const [ domainName, setDomainName ] = useState( initialQuery ?? '' );
	const [ domainNameValidationError, setDomainNameValidationError ] = useState();
	const [ isFetchingAvailability, setIsFetchingAvailability ] = useState( false );
	const [ mode, setMode ] = useState( inputMode.domainInput );
	const initialValidation = useRef( null );

	const baseClassName = 'use-my-domain';

	const onGoBack = () => {
		if ( inputMode.domainInput === mode ) {
			goBack();
		}

		setMode( inputMode.domainInput );
	};

	const validateDomainName = useCallback( () => {
		const errorMessage = getDomainNameValidationErrorMessage( domainName );
		setDomainNameValidationError( errorMessage );
		return ! errorMessage;
	}, [ domainName ] );

	const onNext = useCallback( () => {
		if ( ! validateDomainName() ) {
			return;
		}

		setIsFetchingAvailability( true );
		setDomainAvailabilityData( {} );

		wpcom
			.domain( domainName )
			.isAvailable( { apiVersion: '1.3', blog_id: selectedSite.ID, is_cart_pre_check: false } )
			.then( ( availabilityData ) => {
				const availabilityErrorMessage = getAvailabilityErrorMessage( {
					availabilityData,
					domainName,
					selectedSite,
				} );

				if ( availabilityErrorMessage ) {
					setDomainNameValidationError( availabilityErrorMessage );
				} else {
					setMode( inputMode.transferOrConnect );
					setDomainAvailabilityData( availabilityData );
				}
			} )
			.catch( ( error ) => setDomainNameValidationError( error ) )
			.finally( () => setIsFetchingAvailability( false ) );
	}, [ domainName, inputMode.transferOrConnect, selectedSite, validateDomainName ] );

	const onDomainNameChange = ( event ) => {
		setDomainName( event.target.value );
		domainNameValidationError && setDomainNameValidationError();
	};

	const onClearInput = () => {
		setDomainName( '' );
		setDomainNameValidationError();
	};

	useEffect( () => {
		if ( ! initialQuery || initialValidation.current ) {
			return;
		}

		initialValidation.current = true;
		initialQuery && ! getDomainNameValidationErrorMessage( initialQuery ) && onNext();
	}, [ initialQuery, onNext ] );

	const renderDomainInput = () => {
		return (
			<UseMyDomainInput
				baseClassName={ baseClassName }
				domainName={ domainName }
				isBusy={ isFetchingAvailability }
				onChange={ onDomainNameChange }
				onClear={ onClearInput }
				onNext={ onNext }
				shouldSetFocus={ ! initialQuery }
				validationError={ domainNameValidationError }
			/>
		);
	};

	const renderTransferOrConnect = () => {
		return (
			<DomainTransferOrConnect
				availability={ domainAvailabilityData }
				domain={ domainName }
				isSignupStep={ isSignupStep }
				onConnect={ onConnect }
				onTransfer={ onTransfer }
				transferDomainUrl={ transferDomainUrl }
			/>
		);
	};

	const headerText =
		mode === inputMode.domainInput
			? __( 'Use a domain I own' )
			: /* translators: %s - the name of the domain the user will add to their site */
			  sprintf( __( 'Use a domain I own: %s' ), domainName );

	return (
		<>
			<BackButton className={ baseClassName + '__go-back' } onClick={ onGoBack }>
				<Gridicon icon="arrow-left" size={ 18 } />
				{ __( 'Back' ) }
			</BackButton>
			<FormattedHeader
				brandFont
				className={ baseClassName + '__page-heading' }
				headerText={ headerText }
				align="left"
			/>
			{ mode === inputMode.domainInput && renderDomainInput() }
			{ mode === inputMode.transferOrConnect && renderTransferOrConnect() }
		</>
	);
}

UseMyDomain.propTypes = {
	goBack: PropTypes.func.isRequired,
	initialQuery: PropTypes.string,
	isSignupStep: PropTypes.bool,
	onConnect: PropTypes.func,
	onTransfer: PropTypes.func,
	selectedSite: PropTypes.object,
	transferDomainUrl: PropTypes.string,
};

export default connect( ( state ) => ( { selectedSite: getSelectedSite( state ) } ) )(
	UseMyDomain
);
