/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { connect } from 'react-redux';
import { Card, Button } from '@automattic/components';
import { BackButton } from '@automattic/onboarding';
import { createElement, createInterpolateElement } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { getSelectedSite } from 'calypso/state/ui/selectors';
import Gridicon from 'calypso/components/gridicon';
import FormattedHeader from 'calypso/components/formatted-header';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormInputValidation from 'calypso/components/forms/form-input-validation';
import FormButton from 'calypso/components/forms/form-button';
import FormTextInput from 'calypso/components/forms/form-text-input';
import page from 'page';
import { domainUseYourDomain } from 'calypso/my-sites/domains/paths';
import { checkDomainAvailability } from 'calypso/lib/domains';
import { domainAvailability } from 'calypso/lib/domains/constants';
import { getAvailabilityNotice } from 'calypso/lib/domains/registration/availability-messages';

/**
 * Style dependencies
 */

import './style.scss';
/**
 * Image dependencies
 */
import domainIllustration from 'calypso/assets/images/illustrations/domain.svg';

// function isMappableOrTransferrabl

function UseMyDomain( { goBack, initialQuery, selectedSite } ) {
	const [ domainName, setDomainName ] = useState( initialQuery ?? '' );
	const [ isFetchingAvailability, setIsFetchingAvailability ] = useState( false );
	const [ domainNameValidationError, setDomainNameValidationError ] = useState();
	const domainNameInput = useRef( null );
	const initialValidation = useRef( null );

	const baseClassName = 'use-my-domain';

	const illustration = domainIllustration && (
		<img src={ domainIllustration } alt="" width={ 160 } />
	);

	const validateDomainName = useCallback( () => {
		if ( ! domainName ) {
			setDomainNameValidationError( __( 'Please enter your domain before continuing.' ) );
			return false;
		}

		if ( ! /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test( domainName ) ) {
			const errorMessage = createInterpolateElement(
				sprintf(
					/* translators: %s - the string the user entered in the domain name field */
					__( 'Are you sure you mean <strong>%s</strong>? This is not a valid domain.' ),
					domainName
				),
				{
					strong: createElement( 'strong' ),
				}
			);

			setDomainNameValidationError( errorMessage );
			return false;
		}

		setDomainNameValidationError();
		return true;
	}, [ domainName ] );

	useEffect( () => {
		! initialQuery && domainNameInput.current.focus();
	}, [ initialQuery, domainNameInput ] );

	useEffect( () => {
		! initialValidation.current && initialQuery && validateDomainName();
		initialValidation.current = true;
	}, [ initialQuery, validateDomainName ] );

	const onNext = () => {
		setIsFetchingAvailability( true );

		if ( validateDomainName() ) {
			// TODO: Redirect to the new Transfer or Connect page
			// This is just a placeholder to test with the existing page

			checkDomainAvailability(
				{
					domainName,
					blogId: selectedSite.ID,
					isCartPreCheck: false,
				},
				( error, data ) => {
					if ( error ) {
						setDomainNameValidationError( error );
						return;
					}

					console.log( error );
					console.log( data );
					// const status = data && data?.status;

					const message = getAvailabilityNotice( domainName, data?.status, {} );
					console.log( message );

					setIsFetchingAvailability( false );
				}
			);
			// page( domainUseYourDomain( selectedSite.slug, domainName ) );
		}
	};

	const onDomainNameChange = ( event ) => {
		setDomainName( event.target.value );
	};

	const onClearInput = () => {
		setDomainName( '' );
		setDomainNameValidationError();
	};

	const keyDown = ( event ) => {
		if ( event.key === 'Enter' ) {
			onNext();
			return;
		}

		if ( event.key === 'Escape' ) {
			onClearInput();
			return;
		}

		domainNameValidationError && setDomainNameValidationError();
	};

	return (
		<>
			<BackButton className={ baseClassName + '__go-back' } onClick={ goBack }>
				<Gridicon icon="arrow-left" size={ 18 } />
				{ __( 'Back' ) }
			</BackButton>
			<FormattedHeader
				brandFont
				className={ baseClassName + '__page-heading' }
				headerText={ __( 'Use a domain I own' ) }
				align="left"
			/>
			<Card className={ baseClassName }>
				<div className={ baseClassName + '__domain-illustration' }>{ illustration }</div>
				<div className={ baseClassName + '__domain-input' }>
					<FormFieldset className={ baseClassName + '__domain-input-fieldset' }>
						<FormTextInput
							placeholder={ __( 'Enter your domain here' ) }
							value={ domainName }
							onChange={ onDomainNameChange }
							onKeyDown={ keyDown }
							isError={ !! domainNameValidationError }
							ref={ domainNameInput }
						/>
						{ domainName && (
							<Button
								className={ baseClassName + '__domain-input-clear' }
								borderless
								onClick={ onClearInput }
							>
								<Gridicon
									className={ baseClassName + '__domain-input-clear-icon' }
									icon="cross"
									size={ 12 }
								/>
							</Button>
						) }
						{ domainNameValidationError && (
							<FormInputValidation isError text={ domainNameValidationError } icon="" />
						) }
					</FormFieldset>
					<FormButton
						className={ baseClassName + '__domain-input-button' }
						primary
						busy={ isFetchingAvailability }
						disabled={ isFetchingAvailability }
						onClick={ onNext }
					>
						{ __( 'Next' ) }
					</FormButton>
				</div>
			</Card>
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
