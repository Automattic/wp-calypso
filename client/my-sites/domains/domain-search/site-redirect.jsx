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
import EmptyContent from 'components/empty-content';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import SiteRedirectStep from './site-redirect-step';
import isSiteUpgradeable from 'state/selectors/is-site-upgradeable';
import isSiteWpcomAtomic from 'state/selectors/is-site-wpcom-atomic';
import { getSiteAdminUrl } from 'state/sites/selectors';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import QueryProductsList from 'components/data/query-products-list';
import { getProductsList } from 'state/products-list/selectors';

class SiteRedirect extends Component {
	static propTypes = {
		cart: PropTypes.object.isRequired,
		selectedSite: PropTypes.object.isRequired,
		selectedSiteSlug: PropTypes.string.isRequired,
		isSiteAtomic: PropTypes.bool.isRequired,
		isSiteUpgradeable: PropTypes.bool.isRequired,
		productsList: PropTypes.object.isRequired,
		translate: PropTypes.func.isRequired,
	};

	handleBackToDomainSearch = () => {
		page( '/domains/add/' + this.props.selectedSiteSlug );
	};

	componentDidMount() {
		this.checkSiteIsUpgradeable( this.props );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( nextProps.selectedSiteId !== this.props.selectedSiteId ) {
			this.checkSiteIsUpgradeable( nextProps );
		}
	}

	checkSiteIsUpgradeable( props ) {
		if ( ! props.isSiteUpgradeable ) {
			page.redirect( '/domains/add' );
		}
	}

	render() {
		const {
			cart,
			selectedSite,
			selectedSiteAdminUrl,
			isSiteAtomic,
			productsList,
			translate,
		} = this.props;

		if ( isSiteAtomic ) {
			return (
				<EmptyContent
					illustration="/calypso/images/illustrations/illustration-empty-results.svg"
					title={ translate( 'Site Redirects are not available for this site.' ) }
					line={ translate( "Try searching plugins for 'redirect'." ) }
					action={ translate( 'Explore the Plugin Directory' ) }
					actionURL={ selectedSiteAdminUrl }
				/>
			);
		}

		return (
			<Main>
				<QueryProductsList />

				<HeaderCake onClick={ this.handleBackToDomainSearch }>
					{ translate( 'Redirect a Site' ) }
				</HeaderCake>

				<SiteRedirectStep cart={ cart } products={ productsList } selectedSite={ selectedSite } />
			</Main>
		);
	}
}

export default connect( ( state ) => ( {
	selectedSite: getSelectedSite( state ),
	selectedSiteId: getSelectedSiteId( state ),
	selectedSiteSlug: getSelectedSiteSlug( state ),
	selectedSiteAdminUrl: getSiteAdminUrl(
		state,
		getSelectedSiteId( state ),
		'/plugin-install.php?s=redirect&tab=search'
	),
	isSiteAtomic: isSiteWpcomAtomic( state, getSelectedSiteId( state ) ),
	isSiteUpgradeable: isSiteUpgradeable( state, getSelectedSiteId( state ) ),
	productsList: getProductsList( state ),
} ) )( localize( SiteRedirect ) );
