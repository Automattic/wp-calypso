/**
 * External dependencies
 */

import { useSelector } from 'react-redux';
import React, { useEffect, useState } from 'react';
import { useTranslate } from 'i18n-calypso';
import classnames from 'classnames';

import StepWrapper from 'calypso/signup/step-wrapper';
import {
	getSecureYourBrand,
	isRequestingSecureYourBrand,
	hasSecureYourBrandError,
} from 'calypso/state/secure-your-brand/selectors';
import { Button, Card } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import QuerySecureYourBrand from 'calypso/components/data/query-secure-your-brand';
import Badge from 'calypso/components/badge';
import { domainRegistration } from 'calypso/lib/cart-values/cart-items';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormRadio from 'calypso/components/forms/form-radio';
import FormLabel from 'calypso/components/forms/form-label';
import { useExperiment } from 'calypso/lib/explat';

/**
 * Style dependencies
 */
import './style.scss';

export default function DomainUpsellStep( props ) {
	const translate = useTranslate();
	const {
		flowName,
		stepName,
		positionInFlow,
		signupDependencies: { siteSlug },
	} = props;

	const headerText = translate( 'Congrats, %s is almost ready!', {
		args: [ siteSlug ],
	} );
	const subHeaderText = translate(
		'You can buy a custom domain to make your site address easier to share and remember. When a visitor uses your custom domain they will be re-directed to %s',
		{
			args: [ siteSlug ],
		}
	);

	const [ isLoadingExperimentAssignment, experimentAssignment ] = useExperiment(
		'domain_upsell_emphasize_free_v3'
	);
	// An A/A experiment to check for anomalies in this location:
	useExperiment( 'explat_test_aa_one_off_20210421' );

	const isInDomainUpsellEmphasizeFreeTest = 'treatment' === experimentAssignment?.variationName;

	return (
		<div
			className={ classnames( 'domain-upsell__step-secton-wrapper', {
				is_in_domain_upsell_emphasize_free_test: isInDomainUpsellEmphasizeFreeTest,
			} ) }
		>
			<StepWrapper
				flowName={ flowName }
				stepName={ stepName }
				positionInFlow={ positionInFlow }
				headerText={ headerText }
				fallbackHeaderText={ headerText }
				subHeaderText={ subHeaderText }
				fallbackSubHeaderText={ subHeaderText }
				isWideLayout={ false }
				stepContent={ RecommendedDomains( {
					...props,
					isInDomainUpsellEmphasizeFreeTest,
					isLoadingExperimentAssignment,
				} ) }
			/>
		</div>
	);
}

function FormattedSuggestion( translate, suggestion, isRecommended ) {
	const currency = suggestion.currency;
	return (
		<div className="domain-upsell__domain-radio-label">
			<div className="domain-upsell__domain-radio-label-domain-wrapper">
				<div className="domain-upsell__domain-radio-label-domain">{ suggestion.domain }</div>
				{ isRecommended && <Badge type="success">{ translate( 'Recommended' ) }</Badge> }
			</div>
			<div className="domain-upsell__registration-fee">
				<div>
					{ translate( 'Registration fee: {{strong}}%(originalCost)s{{/strong}}', {
						args: {
							originalCost: formatCurrency( suggestion.cost, currency, { stripZeros: true } ),
						},
						components: { strike: <strike />, strong: <strong /> },
					} ) }
				</div>
				<small>
					{ translate( 'Renews at %(cost)s / year', {
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
		additionalStepData,
		stepSectionName,
		stepName,
		submitSignupStep,
		goToNextStep,
		isInDomainUpsellEmphasizeFreeTest,
		isLoadingExperimentAssignment,
	} = props;
	const translate = useTranslate();
	const [ selectedDomain, setSelectedDomain ] = useState( null );
	const selectDomain = ( event ) => setSelectedDomain( event.target.value );
	const secureYourBrand = useSelector( ( state ) => getSecureYourBrand( state ) );
	const isSecureYourBrandLoading = useSelector( ( state ) => isRequestingSecureYourBrand( state ) );
	const hasError = useSelector( ( state ) => hasSecureYourBrandError( state ) );
	const productData = secureYourBrand.product_data;
	const selectedProduct = productData?.filter(
		( product ) => product.domain === selectedDomain
	)[ 0 ];

	const isLoading = isSecureYourBrandLoading || isLoadingExperimentAssignment;

	const upgradeCtaText = isInDomainUpsellEmphasizeFreeTest
		? translate( 'Use %(selectedDomain)s (%(originalCost)s)', {
				args: {
					selectedDomain,
					originalCost: formatCurrency( selectedProduct?.cost, selectedProduct?.currency, {
						stripZeros: true,
					} ),
				},
		  } )
		: translate( 'Use %s', { args: [ selectedDomain ] } );

	useEffect( () => {
		if ( productData && ! selectedDomain ) {
			setSelectedDomain( productData[ 0 ].domain );
		}
	}, [ productData, selectedDomain, setSelectedDomain ] );

	const handleUpgradeButtonClick = () => {
		if ( ! selectedProduct ) {
			return;
		}

		const selectedDomainUpsellItem = domainRegistration( {
			domain: selectedProduct.domain,
			productSlug: selectedProduct.product_slug,
		} );
		const step = {
			stepName,
			stepSectionName,
			selectedDomainUpsellItem,
			...additionalStepData,
		};

		submitSignupStep( step, { selectedDomainUpsellItem } );
		goToNextStep();
	};

	const handleSkipButtonClick = () => {
		const step = {
			stepName,
			stepSectionName,
			selectedDomainUpsellItem: null,
			...additionalStepData,
		};

		submitSignupStep( step, { selectedDomainUpsellItem: null } );
		goToNextStep();
	};

	if ( hasError ) {
		handleSkipButtonClick();
	}

	return (
		<div className="domain-upsell">
			{ ! productData && ! isLoading && ! hasError && <QuerySecureYourBrand domain={ siteSlug } /> }
			<Card className="domain-upsell__card">
				{ isLoading ? (
					[ ...Array( 3 ) ].map( ( e, i ) => (
						<div key={ `${ i }` } className="domain-upsell__placeholder">
							<div className="domain-upsell__placeholder-animation"></div>
						</div>
					) )
				) : (
					<FormFieldset>
						{ productData?.map( ( suggestion, index ) => (
							<FormLabel className="domain-upsell__domain-radio" key={ suggestion.domain }>
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
				<div className="domain-upsell__buttons">
					<Button busy={ isLoading } primary onClick={ handleUpgradeButtonClick }>
						{ isLoading ? translate( 'Loading' ) : upgradeCtaText }
					</Button>
					{ isInDomainUpsellEmphasizeFreeTest && ! isLoading && (
						<Button onClick={ handleSkipButtonClick }>
							{ translate( 'Use %s (free)', { args: [ siteSlug ] } ) }
						</Button>
					) }
				</div>
			</Card>
			{ ! isInDomainUpsellEmphasizeFreeTest && ! isLoading && (
				<div className="domain-upsell__continue-link">
					<Button compact borderless plain onClick={ handleSkipButtonClick }>
						{ translate( `No thanks, I'll stick with %s`, {
							args: [ siteSlug ],
						} ) }
					</Button>
				</div>
			) }
		</div>
	);
}
