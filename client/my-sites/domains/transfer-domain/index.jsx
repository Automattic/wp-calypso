/** @format */

/**
 * External dependencies
 */
import page from 'page';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';
import TransferDomainStep from 'components/domains/transfer-domain-step';
import { DOMAINS_WITH_PLANS_ONLY } from 'state/current-user/constants';
import { cartItems } from 'lib/cart-values';
import upgradesActions from 'lib/upgrades/actions';
import Notice from 'components/notice';
import { currentUserHasFlag } from 'state/current-user/selectors';
import { isSiteUpgradeable } from 'state/selectors';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import QueryProductsList from 'components/data/query-products-list';
import { getProductsList } from 'state/products-list/selectors';

export class TransferDomain extends Component {
	static propTypes = {
		initialQuery: PropTypes.string,
		query: PropTypes.string,
		cart: PropTypes.object.isRequired,
		domainsWithPlansOnly: PropTypes.bool.isRequired,
		isSiteUpgradeable: PropTypes.bool,
		productsList: PropTypes.object.isRequired,
		selectedSite: PropTypes.object,
		selectedSiteId: PropTypes.number,
		selectedSiteSlug: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	state = {
		errorMessage: null,
	};

	goBack = () => {
		const { selectedSite, selectedSiteSlug } = this.props;

		if ( ! selectedSite ) {
			page( '/domains/add' );
			return;
		}

		page( '/domains/add/' + selectedSiteSlug );
	};

	handleRegisterDomain = suggestion => {
		const { selectedSiteSlug } = this.props;

		upgradesActions.addItem(
			cartItems.domainRegistration( {
				productSlug: suggestion.product_slug,
				domain: suggestion.domain_name,
			} )
		);

		page( '/checkout/' + selectedSiteSlug );
	};

	handleTransferDomain = domain => {
		const { selectedSiteSlug } = this.props;

		this.setState( { errorMessage: null } );

		const transferItems = [];

		transferItems.push(
			cartItems.domainTransfer( {
				domain,
			} )
		);

		transferItems.push(
			cartItems.domainTransferPrivacy( {
				domain,
			} )
		);

		upgradesActions.addItems( transferItems );

		page( '/checkout/' + selectedSiteSlug );
	};

	componentWillMount() {
		this.checkSiteIsUpgradeable( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		this.checkSiteIsUpgradeable( nextProps );
	}

	checkSiteIsUpgradeable( props ) {
		if ( props.selectedSite && ! props.isSiteUpgradeable ) {
			page.redirect( '/domains/add/transfer' );
		}
	}

	render() {
		const {
			cart,
			domainsWithPlansOnly,
			initialQuery,
			productsList,
			selectedSite,
			translate,
		} = this.props;

		const { errorMessage } = this.state;

		return (
			<span>
				<QueryProductsList />

				<HeaderCake onClick={ this.goBack }>{ translate( 'Use My Own Domain' ) }</HeaderCake>

				{ errorMessage && <Notice status="is-error" text={ errorMessage } /> }

				<TransferDomainStep
					basePath={ this.props.basePath }
					cart={ cart }
					domainsWithPlansOnly={ domainsWithPlansOnly }
					initialQuery={ initialQuery }
					products={ productsList }
					selectedSite={ selectedSite }
					onRegisterDomain={ this.handleRegisterDomain }
					onTransferDomain={ this.handleTransferDomain }
					analyticsSection="domains"
				/>
			</span>
		);
	}
}

export default connect( state => ( {
	selectedSite: getSelectedSite( state ),
	selectedSiteId: getSelectedSiteId( state ),
	selectedSiteSlug: getSelectedSiteSlug( state ),
	domainsWithPlansOnly: currentUserHasFlag( state, DOMAINS_WITH_PLANS_ONLY ),
	isSiteUpgradeable: isSiteUpgradeable( state, getSelectedSiteId( state ) ),
	productsList: getProductsList( state ),
} ) )( localize( TransferDomain ) );
