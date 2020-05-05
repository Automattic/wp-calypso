/**
 * External dependencies
 */
import page from 'page';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { get, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import TransferDomainStep from 'components/domains/transfer-domain-step';
import { DOMAINS_WITH_PLANS_ONLY } from 'state/current-user/constants';
import {
	domainRegistration,
	domainTransfer,
	updatePrivacyForDomain,
} from 'lib/cart-values/cart-items';
import { addItem, addItems } from 'lib/cart/actions';
import Notice from 'components/notice';
import { currentUserHasFlag } from 'state/current-user/selectors';
import isSiteUpgradeable from 'state/selectors/is-site-upgradeable';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import QueryProductsList from 'components/data/query-products-list';
import { getProductsList } from 'state/products-list/selectors';
import TrademarkClaimsNotice from 'components/domains/trademark-claims-notice';

export class TransferDomain extends Component {
	static propTypes = {
		initialQuery: PropTypes.string,
		useStandardBack: PropTypes.bool,
		query: PropTypes.string,
		cart: PropTypes.object.isRequired,
		domainsWithPlansOnly: PropTypes.bool.isRequired,
		isSiteUpgradeable: PropTypes.bool,
		productsList: PropTypes.object.isRequired,
		selectedSite: PropTypes.object,
		selectedSiteId: PropTypes.number,
		selectedSiteSlug: PropTypes.string,
	};

	state = {
		errorMessage: null,
		suggestion: null,
		showTrademarkClaimsNotice: false,
	};

	goBack = () => {
		const { selectedSite, selectedSiteSlug, useStandardBack } = this.props;

		if ( useStandardBack ) {
			page.back();
			return;
		}

		if ( ! selectedSite ) {
			page( '/domains/add' );
			return;
		}

		page( '/domains/add/' + selectedSiteSlug );
	};

	addDomainToCart = ( suggestion ) => {
		const { selectedSiteSlug } = this.props;

		addItem(
			domainRegistration( {
				productSlug: suggestion.product_slug,
				domain: suggestion.domain_name,
			} )
		);

		page( '/checkout/' + selectedSiteSlug );
	};

	handleRegisterDomain = ( suggestion ) => {
		const trademarkClaimsNoticeInfo = get( suggestion, 'trademark_claims_notice_info' );
		if ( ! isEmpty( trademarkClaimsNoticeInfo ) ) {
			this.setState( {
				suggestion,
				showTrademarkClaimsNotice: true,
			} );
			return;
		}

		this.addDomainToCart( suggestion );
	};

	handleTransferDomain = ( domain, authCode, supportsPrivacy ) => {
		const { selectedSiteSlug } = this.props;

		this.setState( { errorMessage: null } );

		let transfer = domainTransfer( {
			domain,
			extra: {
				auth_code: authCode,
				privacy_available: supportsPrivacy,
			},
		} );

		if ( supportsPrivacy ) {
			transfer = updatePrivacyForDomain( transfer, true );
		}

		addItems( [ transfer ] );

		page( '/checkout/' + selectedSiteSlug );
	};

	UNSAFE_componentWillMount() {
		this.checkSiteIsUpgradeable( this.props );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		this.checkSiteIsUpgradeable( nextProps );
	}

	checkSiteIsUpgradeable( props ) {
		if ( props.selectedSite && ! props.isSiteUpgradeable ) {
			page.redirect( '/domains/add/transfer' );
		}
	}

	rejectTrademarkClaim = () => {
		this.setState( { showTrademarkClaimsNotice: false } );
	};

	acceptTrademarkClaim = () => {
		const { suggestion } = this.state;
		this.addDomainToCart( suggestion );
	};

	trademarkClaimsNotice = () => {
		const { suggestion } = this.state;
		const domain = get( suggestion, 'domain_name' );
		const trademarkClaimsNoticeInfo = get( suggestion, 'trademark_claims_notice_info' );

		return (
			<TrademarkClaimsNotice
				basePath={ this.props.path }
				domain={ domain }
				onGoBack={ this.rejectTrademarkClaim }
				onAccept={ this.acceptTrademarkClaim }
				onReject={ this.rejectTrademarkClaim }
				trademarkClaimsNoticeInfo={ trademarkClaimsNoticeInfo }
			/>
		);
	};

	render() {
		if ( this.state.showTrademarkClaimsNotice ) {
			return this.trademarkClaimsNotice();
		}

		const { cart, domainsWithPlansOnly, initialQuery, selectedSite } = this.props;

		const { errorMessage } = this.state;

		return (
			<span>
				<QueryProductsList />
				{ errorMessage && <Notice status="is-error" text={ errorMessage } /> }

				<TransferDomainStep
					basePath={ this.props.basePath }
					cart={ cart }
					domainsWithPlansOnly={ domainsWithPlansOnly }
					goBack={ this.goBack }
					initialQuery={ initialQuery }
					selectedSite={ selectedSite }
					onRegisterDomain={ this.handleRegisterDomain }
					onTransferDomain={ this.handleTransferDomain }
					analyticsSection="domains"
				/>
			</span>
		);
	}
}

export default connect( ( state ) => ( {
	selectedSite: getSelectedSite( state ),
	selectedSiteId: getSelectedSiteId( state ),
	selectedSiteSlug: getSelectedSiteSlug( state ),
	domainsWithPlansOnly: currentUserHasFlag( state, DOMAINS_WITH_PLANS_ONLY ),
	isSiteUpgradeable: isSiteUpgradeable( state, getSelectedSiteId( state ) ),
	productsList: getProductsList( state ),
} ) )( TransferDomain );
