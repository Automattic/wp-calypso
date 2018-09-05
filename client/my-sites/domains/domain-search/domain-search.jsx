/** @format */
/**
 * External dependencies
 */
import { connect } from 'react-redux';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';
import EmptyContent from 'components/empty-content';
import { DOMAINS_WITH_PLANS_ONLY } from 'state/current-user/constants';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import RegisterDomainStep from 'components/domains/register-domain-step';
import PlansNavigation from 'my-sites/plans/navigation';
import Main from 'components/main';
import { addItem, addItems, goToDomainCheckout, removeDomainFromCart } from 'lib/upgrades/actions';
import cartItems from 'lib/cart-values/cart-items';
import { currentUserHasFlag } from 'state/current-user/selectors';
import isSiteUpgradeable from 'state/selectors/is-site-upgradeable';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import QueryProductsList from 'components/data/query-products-list';
import { getProductsList } from 'state/products-list/selectors';
import { recordAddDomainButtonClick, recordRemoveDomainButtonClick } from 'state/domains/actions';
import EmailVerificationGate from 'components/email-verification/email-verification-gate';

class DomainSearch extends Component {
	static propTypes = {
		basePath: PropTypes.string.isRequired,
		context: PropTypes.object.isRequired,
		domainsWithPlansOnly: PropTypes.bool.isRequired,
		isSiteUpgradeable: PropTypes.bool,
		productsList: PropTypes.object.isRequired,
		selectedSite: PropTypes.object,
		selectedSiteId: PropTypes.number,
		selectedSiteSlug: PropTypes.string,
	};

	state = {
		domainRegistrationAvailable: true,
		domainRegistrationMaintenanceEndTime: null,
	};

	handleDomainsAvailabilityChange = ( isAvailable, maintenanceEndTime = null ) => {
		this.setState( {
			domainRegistrationAvailable: isAvailable,
			domainRegistrationMaintenanceEndTime: maintenanceEndTime,
		} );
	};

	handleAddRemoveDomain = suggestion => {
		if ( ! cartItems.hasDomainInCart( this.props.cart, suggestion.domain_name ) ) {
			this.addDomain( suggestion );
		} else {
			this.removeDomain( suggestion );
		}
	};

	handleAddMapping = domain => {
		addItem( cartItems.domainMapping( { domain } ) );
		page( '/checkout/' + this.props.selectedSiteSlug );
	};

	handleAddTransfer = domain => {
		addItem( cartItems.domainTransfer( { domain } ) );
		page( '/checkout/' + this.props.selectedSiteSlug );
	};

	componentWillMount() {
		this.checkSiteIsUpgradeable( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.selectedSiteId !== this.props.selectedSiteId ) {
			this.checkSiteIsUpgradeable( nextProps );
		}
	}

	checkSiteIsUpgradeable( props ) {
		if ( props.selectedSite && ! props.isSiteUpgradeable ) {
			page.redirect( '/domains/add' );
		}
	}

	addDomain( suggestion ) {
		this.props.recordAddDomainButtonClick( suggestion.domain_name, 'domains' );

		const items = [
			cartItems.domainRegistration( {
				domain: suggestion.domain_name,
				productSlug: suggestion.product_slug,
				extra: { privacy_available: suggestion.supports_privacy },
			} ),
		];

		if ( suggestion.supports_privacy ) {
			items.push(
				cartItems.domainPrivacyProtection( {
					domain: suggestion.domain_name,
				} )
			);
		}

		addItems( items );
		goToDomainCheckout( suggestion, this.props.selectedSiteSlug );
	}

	removeDomain( suggestion ) {
		this.props.recordRemoveDomainButtonClick( suggestion.domain_name );
		removeDomainFromCart( suggestion );
	}

	render() {
		const { selectedSite, selectedSiteSlug, translate } = this.props;
		const classes = classnames( 'main-column', {
			'domain-search-page-wrapper': this.state.domainRegistrationAvailable,
		} );
		const { domainRegistrationMaintenanceEndTime } = this.state;
		let content;

		if ( ! this.state.domainRegistrationAvailable ) {
			let maintenanceEndTime = translate( 'shortly', {
				comment: 'If a specific maintenance end time is unavailable, we will show this instead.',
			} );
			if ( domainRegistrationMaintenanceEndTime ) {
				maintenanceEndTime = moment.unix( domainRegistrationMaintenanceEndTime ).fromNow();
			}

			content = (
				<EmptyContent
					illustration="/calypso/images/illustrations/error.svg"
					title={ translate( 'Domain registration is unavailable' ) }
					line={ translate( "We're hard at work on the issue. Please check back %(timePeriod)s.", {
						args: {
							timePeriod: maintenanceEndTime,
						},
					} ) }
					action={ translate( 'Back to Plans' ) }
					actionURL={ '/plans/' + selectedSiteSlug }
				/>
			);
		} else {
			content = (
				<span>
					<div className="domain-search__content">
						<PlansNavigation cart={ this.props.cart } path={ this.props.context.path } />

						<EmailVerificationGate
							noticeText={ translate( 'You must verify your email to register new domains.' ) }
							noticeStatus="is-info"
						>
							<RegisterDomainStep
								path={ this.props.context.path }
								suggestion={ this.props.context.query.suggestion }
								domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
								onDomainsAvailabilityChange={ this.handleDomainsAvailabilityChange }
								onAddDomain={ this.handleAddRemoveDomain }
								onAddMapping={ this.handleAddMapping }
								onAddTransfer={ this.handleAddTransfer }
								cart={ this.props.cart }
								selectedSite={ selectedSite }
								offerUnavailableOption
								basePath={ this.props.basePath }
								products={ this.props.productsList }
								vendor={ abtest( 'domainManagementSuggestion' ) }
							/>
						</EmailVerificationGate>
					</div>
				</span>
			);
		}

		return (
			<Main className={ classes } wideLayout>
				<QueryProductsList />
				<SidebarNavigation />
				{ content }
			</Main>
		);
	}
}

export default connect(
	state => ( {
		selectedSite: getSelectedSite( state ),
		selectedSiteId: getSelectedSiteId( state ),
		selectedSiteSlug: getSelectedSiteSlug( state ),
		domainsWithPlansOnly: currentUserHasFlag( state, DOMAINS_WITH_PLANS_ONLY ),
		isSiteUpgradeable: isSiteUpgradeable( state, getSelectedSiteId( state ) ),
		productsList: getProductsList( state ),
	} ),
	{
		recordAddDomainButtonClick,
		recordRemoveDomainButtonClick,
	}
)( localize( DomainSearch ) );
