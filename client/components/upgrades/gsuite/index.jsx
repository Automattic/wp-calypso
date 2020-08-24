/**
 * External dependencies
 */
import page from 'page';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { addItems } from 'lib/cart/actions';
import { hasDomainInCart } from 'lib/cart-values/cart-items';
import { GSUITE_BASIC_SLUG } from 'lib/gsuite/constants';
import GSuiteUpsellCard from './gsuite-upsell-card';
import HeaderCake from 'components/header-cake';
import { getSelectedSiteSlug } from 'state/ui/selectors';

const GSuiteUpgrade = ( { cart, domain, selectedSiteSlug } ) => {
	const handleAddEmailClick = ( cartItems ) => {
		addItems( cartItems );

		page( `/checkout/${ selectedSiteSlug }` );
	};

	const handleGoBack = () => {
		page( `/domains/add/${ selectedSiteSlug }` );
	};

	const handleSkipClick = () => {
		page( `/checkout/${ selectedSiteSlug }` );
	};

	useEffect( () => {
		if ( cart && cart.hasLoadedFromServer && ! hasDomainInCart( cart, domain ) ) {
			// Should we handle this more gracefully?
			page( `/domains/add/${ selectedSiteSlug }` );
		}
	}, [ cart, domain, selectedSiteSlug ] );

	const translate = useTranslate();

	return (
		<div>
			<HeaderCake onClick={ handleGoBack }>
				{ translate( 'Register %(domain)s', { args: { domain } } ) }
			</HeaderCake>

			<GSuiteUpsellCard
				domain={ domain }
				productSlug={ GSUITE_BASIC_SLUG }
				onSkipClick={ handleSkipClick }
				onAddEmailClick={ handleAddEmailClick }
			/>
		</div>
	);
};

export default connect( ( state ) => ( {
	selectedSiteSlug: getSelectedSiteSlug( state ),
} ) )( GSuiteUpgrade );
