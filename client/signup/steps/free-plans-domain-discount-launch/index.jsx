/**
 * External dependencies
 */

import { useSelector } from 'react-redux';
import React, { useEffect, useState } from 'react';
import { useTranslate } from 'i18n-calypso';

import StepWrapper from 'calypso/signup/step-wrapper';
import {
	getSecureYourBrand,
	isRequestingSecureYourBrand,
} from 'calypso/state/secure-your-brand/selectors';
import { Button, Card } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import QuerySecureYourBrand from 'calypso/components/data/query-secure-your-brand';
import Badge from 'calypso/components/badge';
import { domainRegistration } from 'calypso/lib/cart-values/cart-items';

/**
 * Style dependencies
 */
import './style.scss';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormRadio from 'calypso/components/forms/form-radio';
import FormLabel from 'calypso/components/forms/form-label';

function handleUpgradeButtonClick( props, selectedDomain, domainUpsellItems ) {
	const { additionalStepData, stepSectionName, stepName, submitSignupStep, goToNextStep } = props;
	if ( ! domainUpsellItems ) {
		return;
	}

	const step = {
		stepName,
		stepSectionName,
		domainUpsellItems,
		...additionalStepData,
	};

	submitSignupStep( step, { domainUpsellItems } );
	goToNextStep();
}

function handleSkipButtonClick( props ) {
	const { additionalStepData, stepSectionName, stepName, submitSignupStep, goToNextStep } = props;

	const step = {
		stepName,
		stepSectionName,
		domainUpsellItems: null,
		...additionalStepData,
	};

	submitSignupStep( step, { domainUpsellItems: null } );
	goToNextStep();
}

export default function FreePlansDomainDiscountLaunchStep( props ) {
	const translate = useTranslate();
	const {
		flowName,
		stepName,
		positionInFlow,
		signupDependencies: { siteSlug },
	} = props;

	const subHeaderText = translate(
		'You can select an easier-to-remember name below at a one-time discounted price:'
	);
	const headerText = translate( 'Congrats, %s is almost ready!', {
		args: [ siteSlug ],
	} );

	return (
		<div className="free-plans-domain-discount-launch__step-secton-wrapper">
			<StepWrapper
				flowName={ flowName }
				stepName={ stepName }
				positionInFlow={ positionInFlow }
				headerText={ headerText }
				fallbackHeaderText={ headerText }
				subHeaderText={ subHeaderText }
				fallbackSubHeaderText={ subHeaderText }
				isWideLayout={ false }
				stepContent={ RecommendedDomains( props ) }
			/>
		</div>
	);
}

function getDomainName( siteSlug ) {
	return siteSlug.replace( '.wordpress.com', '.blog' );
}

function FormattedSuggestion( translate, suggestion, isRecommended ) {
	const currency = suggestion.currency;
	return (
		<div className="free-plans-domain-discount-launch__domain-radio-label">
			<div className="free-plans-domain-discount-launch__domain-radio-label-domain-wrapper">
				<div className="free-plans-domain-discount-launch__domain-radio-label-domain">
					{ suggestion.domain }
				</div>
				{ isRecommended && <Badge type="success">{ translate( 'Recommended' ) }</Badge> }
			</div>
			<div>
				<div>
					{ translate( 'Registration fee: {{strong}}%(originalCost)s{{/strong}}', {
						args: {
							originalCost: formatCurrency( suggestion.cost, currency, { stripZeros: true } ),
						},
						components: { strike: <strike />, strong: <strong /> },
					} ) }
				</div>
				<small>
					{ translate( 'Renews at: %(cost)s /year', {
						args: { cost: formatCurrency( suggestion.cost, currency, { stripZeros: true } ) },
					} ) }
				</small>
			</div>
		</div>
	);
}

function RecommendedDomains( props ) {
	const {
		signupDependencies: { siteSlug },
	} = props;
	const translate = useTranslate();
	const [ selectedDomain, setSelectedDomain ] = useState( null );
	const selectDomain = ( event ) => setSelectedDomain( event.target.value );
	const secureYourBrand = useSelector( ( state ) => getSecureYourBrand( state ) );
	const isLoading = useSelector( ( state ) => isRequestingSecureYourBrand( state ) );
	const domain = getDomainName( siteSlug );
	const productData = secureYourBrand.product_data;
	const domainUpsellItems = productData
		?.filter( ( product ) => product.domain === selectedDomain )
		?.map( ( product ) =>
			domainRegistration( { domain: product.domain, productSlug: product.product_slug } )
		);

	useEffect( () => {
		if ( productData && ! selectedDomain ) {
			setSelectedDomain( productData[ 0 ].domain );
		}
	}, [ productData, selectedDomain, setSelectedDomain ] );
	return (
		<div className="free-plans-domain-discount-launch">
			{ ! productData && <QuerySecureYourBrand domain={ domain } /> }
			<Card style={ { maxWidth: '615px' } } className="free-plans-domain-discount-launch__card">
				{ isLoading ? (
					[ ...Array( 3 ) ].map( ( i ) => (
						<div key={ i } className="free-plans-domain-discount-launch__placeholder">
							<div className="free-plans-domain-discount-launch__placeholder-animation"></div>
						</div>
					) )
				) : (
					<FormFieldset>
						{ productData?.map( ( suggestion, index ) => (
							<FormLabel
								className="free-plans-domain-discount-launch__domain-radio"
								key={ suggestion.domain }
							>
								<FormRadio
									checked={ selectedDomain === suggestion.domain }
									onChange={ selectDomain }
									label={ FormattedSuggestion( translate, suggestion, index === 0 ) }
									value={ suggestion.domain }
								/>
							</FormLabel>
						) ) }
					</FormFieldset>
				) }
				<div className="free-plans-domain-discount-launch__buttons">
					<Button
						busy={ isLoading }
						primary
						onClick={ handleUpgradeButtonClick.bind(
							this,
							props,
							selectedDomain,
							domainUpsellItems
						) }
					>
						{ isLoading ? '' : translate( 'Use %s', { args: [ selectedDomain ] } ) }
					</Button>
				</div>
			</Card>
			<div className="free-plans-domain-discount-launch__continue-link">
				<Button compact borderless plain onClick={ handleSkipButtonClick.bind( this, props ) }>
					{ translate( 'No thanks, continue to %s', {
						args: [ siteSlug ],
					} ) }
				</Button>
			</div>
		</div>
	);
}
