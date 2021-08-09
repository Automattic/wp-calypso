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
import page from 'page';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import { getSelectedSite } from 'calypso/state/ui/selectors';
import Gridicon from 'calypso/components/gridicon';
import FormattedHeader from 'calypso/components/formatted-header';
import { currentUserHasFlag, getCurrentUser } from 'calypso/state/current-user/selectors';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import {
	DOMAINS_WITH_PLANS_ONLY,
	NON_PRIMARY_DOMAINS_TO_FREE_USERS,
} from 'calypso/state/current-user/constants';
import { getProductsList } from 'calypso/state/products-list/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	checkDomainAvailability,
	getDomainPrice,
	getDomainProductSlug,
	getDomainTransferSalePrice,
} from 'calypso/lib/domains';
import OptionContent from './option-content';
import { optionInfo } from './option-info';
import { CALYPSO_CONTACT } from 'calypso/lib/url/support';
import { isPlan } from '@automattic/calypso-products';
import {
	isDomainBundledWithPlan,
	isDomainMappingFree,
	isNextDomainFree,
} from 'calypso/lib/cart-values/cart-items';

/**
 * Style dependencies
 */
import './style.scss';

function DomainTransferOrConnect( {
	domain,
	goBack,
	selectedSite,
	mappingPriceText,
	transferFreeText,
	transferSalePriceText,
	transferPriceText,
} ) {
	console.log( mappingPriceText, transferFreeText, transferSalePriceText, transferPriceText );
	const content = [
		{ primary: true, ...optionInfo.transferSupported },
		{ primary: false, ...optionInfo.connectSupported },
	];
	const baseClassName = 'domain-transfer-or-connect';

	/* translators: %s - the user's domain name (ex.: example.com) */
	const headerText = sprintf( __( 'Use a domain I own: %s' ), domain );

	useEffect( () => {
		checkDomainAvailability(
			{
				domainName: domain,
				blogId: selectedSite.ID,
				isCartPreCheck: false,
			},
			( error, data ) => {
				console.log( data );
			}
		);
	}, [ domain, selectedSite.ID ] );

	return (
		<div className={ baseClassName }>
			<BackButton className={ baseClassName + '__go-back' } onClick={ goBack }>
				<Gridicon icon="arrow-left" size={ 18 } />
				{ __( 'Back' ) }
			</BackButton>
			<FormattedHeader
				brandFont
				className={ baseClassName + '__page-heading' }
				headerText={ headerText }
				align="left"
			/>
			<Card className={ baseClassName + '__content' }>
				{ content.map( ( optionProps, index ) => (
					<OptionContent key={ 'option-' + index } { ...optionProps } />
				) ) }
				<div className={ baseClassName + '__support-link' }>
					{ createInterpolateElement(
						__( "Not sure what's best for you? <a>We're happy to help!</a>" ),
						{ a: createElement( 'a', { href: CALYPSO_CONTACT } ) }
					) }
				</div>
			</Card>
		</div>
	);
}

DomainTransferOrConnect.propTypes = {
	goBack: PropTypes.func.isRequired,
	initialQuery: PropTypes.string,
	selectedSite: PropTypes.object,
};

const recordTransferButtonClickInUseYourDomain = ( domain_name ) =>
	recordTracksEvent( 'calypso_use_your_domain_transfer_click', { domain_name } );

const recordMappingButtonClickInUseYourDomain = ( domain_name ) =>
	recordTracksEvent( 'calypso_use_your_domain_mapping_click', { domain_name } );

const getTransferFreeText = ( props ) => {
	const { nextDomainIsFree, domainsWithPlansOnlyButNoPlan, domainIsBundledWithPlan } = props;

	let domainProductFreeText = null;

	if ( nextDomainIsFree || domainIsBundledWithPlan ) {
		domainProductFreeText = __( 'No additional charge with your plan' );
	} else if ( domainsWithPlansOnlyButNoPlan ) {
		domainProductFreeText = __( 'No additional charge with paid plans' );
	}

	return domainProductFreeText;
};

const getTransferSalePriceText = ( props ) => {
	const {
		domainProductSalePrice,
		domainsWithPlansOnlyButNoPlan,
		domainIsBundledWithPlan,
		nextDomainIsFree,
	} = props;

	if (
		! domainProductSalePrice ||
		nextDomainIsFree ||
		domainIsBundledWithPlan ||
		domainsWithPlansOnlyButNoPlan
	) {
		return;
	}

	/* translators: $s - sale price for a domain in the user's currency */
	return sprintf( __( 'Sale price is %s' ), domainProductSalePrice );
};

const getTransferPriceText = ( props ) => {
	const {
		domainIsBundledWithPlan,
		domainProductPrice,
		domainsWithPlansOnlyButNoPlan,
		nextDomainIsFree,
		transferSalePriceText,
	} = props;

	if (
		domainProductPrice &&
		( nextDomainIsFree ||
			domainIsBundledWithPlan ||
			domainsWithPlansOnlyButNoPlan ||
			transferSalePriceText )
	) {
		/* translators: %s - annual renewal price for a domain in the user's currency */
		return sprintf( __( '%s/year renewal' ), domainProductPrice );
	}

	if ( domainProductPrice ) {
		/* translators: %s - price per year for a domain in the user's currency */
		return sprintf( __( '%s/year' ), domainProductPrice );
	}
};

const getMappingPriceText = ( props ) => {
	const {
		currencyCode,
		domainIsBundledWithPlan,
		domainMappingIsFree,
		domainsWithPlansOnly,
		primaryWithPlansOnly,
		productsList,
		nextDomainIsFree,
	} = props;

	let mappingProductPrice;

	const price = productsList?.domain_map?.cost || null;

	if ( price ) {
		mappingProductPrice = formatCurrency( price, currencyCode );
		mappingProductPrice = sprintf(
			/* translators: %s - cost to connect a domain in user's currency */
			__( '%s/year' ),
			mappingProductPrice
		);
	}

	if ( domainMappingIsFree || nextDomainIsFree || domainIsBundledWithPlan ) {
		mappingProductPrice = __( 'No additional charge with your plan' );
	} else if ( domainsWithPlansOnly || primaryWithPlansOnly ) {
		mappingProductPrice = __( 'No additional charge with paid plans' );
	}

	return mappingProductPrice;
};

export default connect(
	( state, props ) => {
		const { cart, domain, isSignupStep } = props;

		const currencyCode = getCurrentUserCurrencyCode( state );
		const domainsWithPlansOnly = currentUserHasFlag( state, DOMAINS_WITH_PLANS_ONLY );
		const domainIsBundledWithPlan = isDomainBundledWithPlan( cart, domain );
		const nextDomainIsFree = isNextDomainFree( cart );
		const primaryWithPlansOnly = currentUserHasFlag( state, NON_PRIMARY_DOMAINS_TO_FREE_USERS );
		const productsList = getProductsList( state );
		const productSlug = getDomainProductSlug( domain );
		const selectedSite = getSelectedSite( state );

		const domainProductPrice = getDomainPrice( productSlug, productsList, currencyCode );
		const domainProductSalePrice = getDomainTransferSalePrice(
			productSlug,
			productsList,
			currencyCode
		);

		const selectedSiteHasPlan = selectedSite && isPlan( selectedSite.plan );
		const domainsWithPlansOnlyButNoPlan =
			domainsWithPlansOnly && ( ! selectedSiteHasPlan || isSignupStep );
		const domainMappingIsFree = selectedSite && isDomainMappingFree( selectedSite );

		const allProps = {
			...props,
			domainMappingIsFree,
			domainProductPrice,
			domainProductSalePrice,
			domainsWithPlansOnlyButNoPlan,
			domainIsBundledWithPlan,
			primaryWithPlansOnly,
			nextDomainIsFree,
		};

		const mappingPriceText = getMappingPriceText( allProps );
		const transferFreeText = getTransferFreeText( allProps );
		const transferSalePriceText = getTransferSalePriceText( allProps );
		const transferPriceText = getTransferPriceText( { ...allProps, transferSalePriceText } );

		return {
			mappingPriceText,
			transferFreeText,
			transferSalePriceText,
			transferPriceText,
			selectedSite,
		};
	},
	{ recordTransferButtonClickInUseYourDomain, recordMappingButtonClickInUseYourDomain }
)( DomainTransferOrConnect );
