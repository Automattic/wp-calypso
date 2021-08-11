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
import { domainAddNew, domainUseYourDomain } from 'calypso/my-sites/domains/paths';
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

		if (
			! /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9])*(?:\.[a-zA-Z]{2,})+$/.test(
				domainName
			)
		) {
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

	const goToSearchPage = () => {
		page( domainAddNew( selectedSite.slug, domainName ) );
	};

	const getAvailabilityErrorMessage = ( availabilityData ) => {
		const { status, mappable, maintenance_end_time, other_site_domain } = availabilityData;

		if ( domainAvailability.AVAILABLE === status ) {
			return createInterpolateElement(
				__( "This domain isn't registered. Did you mean to <a>search for a domain</a> instead?" ),
				{
					a: createElement( 'a', { href: '#', onClick: goToSearchPage } ),
				}
			);
		}

		if (
			! [
				domainAvailability.AVAILABILITY_CHECK_ERROR,
				domainAvailability.NOT_REGISTRABLE,
			].includes( status ) &&
			[ domainAvailability.MAPPABLE, domainAvailability.UNKNOWN ].includes( mappable )
		) {
			return null;
		}

		const availabilityStatus = domainAvailability.MAPPED === mappable ? status : mappable;
		const maintenanceEndTime = maintenance_end_time ?? null;
		const site = other_site_domain ?? selectedSite.slug;

		const errorData = getAvailabilityNotice( domainName, availabilityStatus, {
			site,
			maintenanceEndTime,
		} );
		return errorData?.message || null;
	};

	const onNext = () => {
		if ( ! validateDomainName() ) {
			return;
		}

		setIsFetchingAvailability( true );

		checkDomainAvailability(
			{
				domainName,
				blogId: selectedSite.ID,
				isCartPreCheck: false,
			},
			( error, data ) => {
				setIsFetchingAvailability( false );

				if ( error ) {
					setDomainNameValidationError( error );
					return;
				}

				const availabilityMessage = getAvailabilityErrorMessage( data );

				if ( availabilityMessage ) {
					setDomainNameValidationError( availabilityMessage );
					return;
				}

				// TODO: This is just a placeholder until the connect or transfer page is completed.
				page( domainUseYourDomain( selectedSite.slug, domainName ) );
			}
		);
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
			! isFetchingAvailability && onNext();
			return;
		}

		if ( event.key === 'Escape' ) {
			onClearInput();
			return;
		}

		domainNameValidationError && setDomainNameValidationError();
	};

	useEffect( () => {
		! initialQuery && domainNameInput.current.focus();
	}, [ initialQuery, domainNameInput ] );

	useEffect( () => {
		! initialValidation.current && initialQuery && onNext();
		initialValidation.current = true;
	}, [ initialQuery, validateDomainName ] );

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
