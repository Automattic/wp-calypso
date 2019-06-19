/** @format */

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
import { addItems } from 'lib/upgrades/actions';
import { hasDomainInCart } from 'lib/cart-values/cart-items';
import GSuiteDialog from './gsuite-dialog';
import HeaderCake from 'components/header-cake';
import { getSelectedSiteSlug } from 'state/ui/selectors';

const GSuiteUpgrade = ( { cart, domainName, selectedSiteSlug } ) => {
	const handleAddEmailClick = cartItems => {
		addItems( cartItems );
		page( `/checkout/${ selectedSiteSlug }` );
	};

	const handleGoBack = () => {
		page( `/domains/add/${ selectedSiteSlug }` );
	};

	const handleSkipClick = () => {
		page( ` /checkout/${ selectedSiteSlug }` );
	};

	useEffect( () => {
		if ( ! cart || ! cart.hasLoadedFromServer ) {
			return;
		}

		if ( ! hasDomainInCart( cart, domainName ) ) {
			// Should we handle this more gracefully?
			page( `/domains/add/${ selectedSiteSlug }` );
		}
	}, [ cart, domainName, selectedSiteSlug ] );

	const translate = useTranslate();

	return (
		<div>
			<HeaderCake onClick={ handleGoBack }>
				{ translate( 'Register %(domain)s', { args: { domain: domainName } } ) }
			</HeaderCake>

			<GSuiteDialog
				domainName={ domainName }
				onSkipClick={ handleSkipClick }
				onAddEmailClick={ handleAddEmailClick }
			/>
		</div>
	);
};

export default connect( state => ( {
	selectedSiteSlug: getSelectedSiteSlug( state ),
} ) )( GSuiteUpgrade );
