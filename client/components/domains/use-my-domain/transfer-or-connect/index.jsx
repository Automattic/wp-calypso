/**
 * External dependencies
 */
import { Card } from '@automattic/components';
import { withShoppingCart } from '@automattic/shopping-cart';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
/**
 * Internal dependencies
 */
import QueryProductsList from 'calypso/components/data/query-products-list';
import { CALYPSO_CONTACT } from 'calypso/lib/url/support';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { NON_PRIMARY_DOMAINS_TO_FREE_USERS } from 'calypso/state/current-user/constants';
import { currentUserHasFlag } from 'calypso/state/current-user/selectors';
import { getProductsList } from 'calypso/state/products-list/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { getOptionInfo } from '../utilities/get-option-info';
import OptionContent from './option-content';
/**
 * Style dependencies
 */
import './style.scss';

function DomainTransferOrConnect( {
	availability,
	cart,
	currencyCode,
	domain,
	isSignupStep,
	primaryWithPlansOnly,
	productsList,
	recordMappingButtonClickInUseYourDomain,
	recordTransferButtonClickInUseYourDomain,
	selectedSite,
} ) {
	const onConnect = () => {
		recordMappingButtonClickInUseYourDomain( domain );
		// TODO: Go to the next step in mapping the domain
	};

	const onTransfer = () => {
		recordTransferButtonClickInUseYourDomain( domain );
		// TODO: Go to the next step in transferring the domain
	};

	const content = getOptionInfo( {
		availability,
		cart,
		currencyCode,
		domain,
		isSignupStep,
		onConnect,
		onTransfer,
		primaryWithPlansOnly,
		productsList,
		selectedSite,
	} );

	const baseClassName = 'domain-transfer-or-connect';

	return (
		<>
			<QueryProductsList />
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
		</>
	);
}

DomainTransferOrConnect.propTypes = {
	availability: PropTypes.object.isRequired,
	domain: PropTypes.string.isRequired,
	selectedSite: PropTypes.object.isRequired,
};

const recordTransferButtonClickInUseYourDomain = ( domain_name ) =>
	recordTracksEvent( 'calypso_use_your_domain_transfer_click', { domain_name } );

const recordMappingButtonClickInUseYourDomain = ( domain_name ) =>
	recordTracksEvent( 'calypso_use_your_domain_mapping_click', { domain_name } );

export default connect(
	( state ) => {
		return {
			currencyCode: getCurrentUserCurrencyCode( state ),
			primaryWithPlansOnly: currentUserHasFlag( state, NON_PRIMARY_DOMAINS_TO_FREE_USERS ),
			productsList: getProductsList( state ),
			selectedSite: getSelectedSite( state ),
		};
	},
	{ recordTransferButtonClickInUseYourDomain, recordMappingButtonClickInUseYourDomain }
)( withShoppingCart( DomainTransferOrConnect ) );
