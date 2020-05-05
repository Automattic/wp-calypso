/**
 * External dependencies
 */
import page from 'page';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';
import MapDomainStep from 'components/domains/map-domain-step';
import { DOMAINS_WITH_PLANS_ONLY } from 'state/current-user/constants';
import { domainRegistration, domainMapping } from 'lib/cart-values/cart-items';
import { addItem } from 'lib/cart/actions';
import wp from 'lib/wp';
import { domainManagementList } from 'my-sites/domains/paths';
import Notice from 'components/notice';
import { currentUserHasFlag } from 'state/current-user/selectors';
import isSiteUpgradeable from 'state/selectors/is-site-upgradeable';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import QueryProductsList from 'components/data/query-products-list';
import { getProductsList } from 'state/products-list/selectors';
import TrademarkClaimsNotice from 'components/domains/trademark-claims-notice';

const wpcom = wp.undocumented();

export class MapDomain extends Component {
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
		suggestion: null,
		showTrademarkClaimsNotice: false,
	};

	goBack = () => {
		const { selectedSite, selectedSiteSlug } = this.props;

		if ( ! selectedSite ) {
			page( '/domains/add' );
			return;
		}

		if ( selectedSite.is_vip ) {
			page( domainManagementList( selectedSiteSlug ) );
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

	handleMapDomain = ( domain ) => {
		const { selectedSite, selectedSiteSlug } = this.props;

		this.setState( { errorMessage: null } );

		// For VIP sites we handle domain mappings differently
		// We don't go through the usual checkout process
		// Instead, we add the mapping directly
		if ( selectedSite.is_vip ) {
			wpcom.addVipDomainMapping( selectedSite.ID, domain ).then(
				() => page( domainManagementList( selectedSiteSlug ) ),
				( error ) => this.setState( { errorMessage: error.message } )
			);
			return;
		}

		addItem( domainMapping( { domain } ) );

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
			page.redirect( '/domains/add/mapping' );
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

				<HeaderCake onClick={ this.goBack }>{ translate( 'Map a Domain' ) }</HeaderCake>

				{ errorMessage && <Notice status="is-error" text={ errorMessage } /> }

				<MapDomainStep
					cart={ cart }
					domainsWithPlansOnly={ domainsWithPlansOnly }
					initialQuery={ initialQuery }
					products={ productsList }
					selectedSite={ selectedSite }
					onRegisterDomain={ this.handleRegisterDomain }
					onMapDomain={ this.handleMapDomain }
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
} ) )( localize( MapDomain ) );
