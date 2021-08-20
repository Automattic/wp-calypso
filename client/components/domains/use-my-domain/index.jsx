/**
 * External dependencies
 */
import { BackButton } from '@automattic/onboarding';
import { __, sprintf } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
/**
 * Internal dependencies
 */
import FormattedHeader from 'calypso/components/formatted-header';
import Gridicon from 'calypso/components/gridicon';
import { checkDomainAvailability } from 'calypso/lib/domains';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import UseMyDomainInput from './domain-input';
import DomainTransferOrConnect from './transfer-or-connect';
import { getAvailabilityErrorMessage, getDomainNameValidationErrorMessage } from './utilities';
/**
 * Style dependencies
 */
import './style.scss';

function UseMyDomain( { goBack, initialQuery, selectedSite } ) {
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

		checkDomainAvailability(
			{
				domainName,
				blogId: selectedSite.ID,
				isCartPreCheck: false,
			},
			( error, availabilityData ) => {
				setIsFetchingAvailability( false );

				if ( error ) {
					setDomainNameValidationError( error );
					return;
				}

				const availabilityErrorMessage = getAvailabilityErrorMessage( {
					availabilityData,
					domainName,
					selectedSite,
				} );

				if ( availabilityErrorMessage ) {
					setDomainNameValidationError( availabilityErrorMessage );
					return;
				}

				setMode( inputMode.transferOrConnect );
				setDomainAvailabilityData( availabilityData );
			}
		);
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
			<DomainTransferOrConnect domain={ domainName } availability={ domainAvailabilityData } />
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
	selectedSite: PropTypes.object,
};

export default connect( ( state ) => ( { selectedSite: getSelectedSite( state ) } ) )(
	UseMyDomain
);
