import { Card } from '@automattic/components';
import { withShoppingCart } from '@automattic/shopping-cart';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { connect } from 'react-redux';
import QueryProductsList from 'calypso/components/data/query-products-list';
import { CALYPSO_CONTACT } from 'calypso/lib/url/support';
import withCartKey from 'calypso/my-sites/checkout/with-cart-key';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { NON_PRIMARY_DOMAINS_TO_FREE_USERS } from 'calypso/state/current-user/constants';
import { currentUserHasFlag } from 'calypso/state/current-user/selectors';
import { getProductsList } from 'calypso/state/products-list/selectors';
import isSiteOnPaidPlan from 'calypso/state/selectors/is-site-on-paid-plan';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { getOptionInfo, connectDomainAction } from '../utilities';
import OptionContent from './option-content';

import './style.scss';

function DomainTransferOrConnect( {
	availability,
	cart,
	currencyCode,
	defaultConnectHandler,
	domain,
	domainInboundTransferStatusInfo,
	isSignupStep,
	onConnect,
	onTransfer,
	primaryWithPlansOnly,
	productsList,
	recordMappingButtonClickInUseYourDomain,
	recordTransferButtonClickInUseYourDomain,
	selectedSite,
	siteIsOnPaidPlan,
	transferDomainUrl,
} ) {
	const [ actionClicked, setActionClicked ] = useState( false );

	const handleConnect = () => {
		recordMappingButtonClickInUseYourDomain( domain );
		setActionClicked( true );

		const connectHandler = onConnect ?? defaultConnectHandler;
		connectHandler( { domain, selectedSite }, () => setActionClicked( false ) );
	};

	const handleTransfer = () => {
		recordTransferButtonClickInUseYourDomain( domain );
		onTransfer( { domain, selectedSite, transferDomainUrl }, () => setActionClicked( false ) );
	};

	const content = getOptionInfo( {
		availability,
		cart,
		currencyCode,
		domain,
		domainInboundTransferStatusInfo,
		isSignupStep,
		onConnect: handleConnect,
		onTransfer: handleTransfer,
		primaryWithPlansOnly,
		productsList,
		selectedSite,
		siteIsOnPaidPlan,
		transferDomainUrl,
	} );

	const baseClassName = 'domain-transfer-or-connect';

	return (
		<>
			<QueryProductsList />
			<Card className={ baseClassName + '__content' }>
				{ content.map( ( optionProps, index ) => (
					<OptionContent key={ 'option-' + index } disabled={ actionClicked } { ...optionProps } />
				) ) }
				<div className={ baseClassName + '__support-link' }>
					{ createInterpolateElement(
						__( "Not sure what's best for you? <a>We're happy to help!</a>" ),
						{ a: createElement( 'a', { target: '_blank', href: CALYPSO_CONTACT } ) }
					) }
				</div>
			</Card>
		</>
	);
}

DomainTransferOrConnect.propTypes = {
	availability: PropTypes.object.isRequired,
	defaultConnectHandler: PropTypes.func,
	defaultTransferHandler: PropTypes.func,
	domain: PropTypes.string.isRequired,
	isSignupStep: PropTypes.bool,
	onConnect: PropTypes.func,
	onTransfer: PropTypes.func,
	selectedSite: PropTypes.object.isRequired,
	transferDomainUrl: PropTypes.string,
};

const recordTransferButtonClickInUseYourDomain = ( domain_name ) =>
	recordTracksEvent( 'calypso_use_your_domain_transfer_click', { domain_name } );

const recordMappingButtonClickInUseYourDomain = ( domain_name ) =>
	recordTracksEvent( 'calypso_use_your_domain_mapping_click', { domain_name } );

export default connect(
	( state ) => {
		const selectedSite = getSelectedSite( state );
		return {
			currencyCode: getCurrentUserCurrencyCode( state ),
			primaryWithPlansOnly: currentUserHasFlag( state, NON_PRIMARY_DOMAINS_TO_FREE_USERS ),
			productsList: getProductsList( state ),
			selectedSite,
			siteIsOnPaidPlan: isSiteOnPaidPlan( state, selectedSite?.ID ),
		};
	},
	{
		defaultConnectHandler: connectDomainAction,
		recordTransferButtonClickInUseYourDomain,
		recordMappingButtonClickInUseYourDomain,
	}
)( withCartKey( withShoppingCart( DomainTransferOrConnect ) ) );
