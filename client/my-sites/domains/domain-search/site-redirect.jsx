/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import SiteRedirectStep from './site-redirect-step';
import QueryProductsList from 'components/data/query-products-list';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import { getProductsList } from 'state/products-list/selectors';
import isSiteUpgradeable from 'state/selectors/is-site-upgradeable';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';

class SiteRedirect extends Component {
	static propTypes = {
		cart: PropTypes.object.isRequired,
		selectedSite: PropTypes.object.isRequired,
		selectedSiteSlug: PropTypes.string.isRequired,
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

	componentWillReceiveProps( nextProps ) {
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
			productsList,
			translate,
		} = this.props;

		return (
			<Main>
				<QueryProductsList />

				<HeaderCake onClick={ this.handleBackToDomainSearch }>
					{ translate( 'Redirect a Site' ) }
				</HeaderCake>

				<SiteRedirectStep
					cart={ cart }
					products={ productsList }
					selectedSite={ selectedSite } />
			</Main>
		);
	}
}

export default connect(
	( state ) => ( {
		selectedSite: getSelectedSite( state ),
		selectedSiteId: getSelectedSiteId( state ),
		selectedSiteSlug: getSelectedSiteSlug( state ),
		isSiteUpgradeable: isSiteUpgradeable( state, getSelectedSiteId( state ) ),
		productsList: getProductsList( state ),
	} )
)( localize( SiteRedirect ) );
