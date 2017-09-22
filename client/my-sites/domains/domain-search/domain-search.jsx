/**
 * External dependencies
 */
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import QueryProductsList from 'components/data/query-products-list';
import RegisterDomainStep from 'components/domains/register-domain-step';
import EmailVerificationGate from 'components/email-verification/email-verification-gate';
import EmptyContent from 'components/empty-content';
import Main from 'components/main';
import { abtest } from 'lib/abtest';
import cartItems from 'lib/cart-values/cart-items';
import upgradesActions from 'lib/upgrades/actions';
import UpgradesNavigation from 'my-sites/domains/navigation';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import { DOMAINS_WITH_PLANS_ONLY } from 'state/current-user/constants';
import { currentUserHasFlag } from 'state/current-user/selectors';
import { recordAddDomainButtonClick, recordRemoveDomainButtonClick } from 'state/domains/actions';
import { getProductsList } from 'state/products-list/selectors';
import { isSiteUpgradeable } from 'state/selectors';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';

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
		domainRegistrationAvailable: true
	};

	handleDomainsAvailabilityChange = ( isAvailable ) => {
		this.setState( { domainRegistrationAvailable: isAvailable } );
	};

	handleAddRemoveDomain = ( suggestion ) => {
		if ( ! cartItems.hasDomainInCart( this.props.cart, suggestion.domain_name ) ) {
			this.addDomain( suggestion );
		} else {
			this.removeDomain( suggestion );
		}
	};

	handleAddMapping = ( domain ) => {
		upgradesActions.addItem( cartItems.domainMapping( { domain } ) );
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
			cartItems.domainRegistration( { domain: suggestion.domain_name, productSlug: suggestion.product_slug } )
		];

		if ( suggestion.supports_privacy &&
			( cartItems.isNextDomainFree( this.props.cart ) || abtest( 'privacyNoPopup' ) === 'nopopup' ) ) {
			items.push( cartItems.domainPrivacyProtection( {
				domain: suggestion.domain_name
			} ) );
		}

		upgradesActions.addItems( items );
		upgradesActions.goToDomainCheckout( suggestion, this.props.selectedSiteSlug );
	}

	removeDomain( suggestion ) {
		this.props.recordRemoveDomainButtonClick( suggestion.domain_name );
		upgradesActions.removeDomainFromCart( suggestion );
	}

	render() {
		const { selectedSite, selectedSiteSlug, translate } = this.props,
			classes = classnames( 'main-column', {
				'domain-search-page-wrapper': this.state.domainRegistrationAvailable
			} );
		let content;

		if ( ! this.state.domainRegistrationAvailable ) {
			content = (
				<EmptyContent
					illustration="/calypso/images/illustrations/illustration-500.svg"
					title={ translate( 'Domain registration is unavailable' ) }
					line={ translate( "We're hard at work on the issue. Please check back shortly." ) }
					action={ translate( 'Back to Plans' ) }
					actionURL={ '/plans/' + selectedSiteSlug } />
			);
		} else {
			content = (
				<span>
					<div className="domain-search__content">
						<UpgradesNavigation
							path={ this.props.context.path }
							cart={ this.props.cart }
							selectedSite={ selectedSite } />

						<EmailVerificationGate
							noticeText={ translate( 'You must verify your email to register new domains.' ) }
							noticeStatus="is-info">
							<RegisterDomainStep
								path={ this.props.context.path }
								suggestion={ this.props.context.params.suggestion }
								domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
								onDomainsAvailabilityChange={ this.handleDomainsAvailabilityChange }
								onAddDomain={ this.handleAddRemoveDomain }
								onAddMapping={ this.handleAddMapping }
								cart={ this.props.cart }
								selectedSite={ selectedSite }
								offerMappingOption
								basePath={ this.props.basePath }
								products={ this.props.productsList } />
						</EmailVerificationGate>
					</div>
				</span>
			);
		}

		return (
			<Main className={ classes }>
				<QueryProductsList />
				<SidebarNavigation />
				{ content }
			</Main>
		);
	}
}

export default connect(
	( state ) => ( {
		selectedSite: getSelectedSite( state ),
		selectedSiteId: getSelectedSiteId( state ),
		selectedSiteSlug: getSelectedSiteSlug( state ),
		domainsWithPlansOnly: currentUserHasFlag( state, DOMAINS_WITH_PLANS_ONLY ),
		isSiteUpgradeable: isSiteUpgradeable( state, getSelectedSiteId( state ) ),
		productsList: getProductsList( state )
	} ),
	{
		recordAddDomainButtonClick,
		recordRemoveDomainButtonClick,
	}
)( localize( DomainSearch ) );
