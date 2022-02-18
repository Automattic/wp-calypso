import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryProductsList from 'calypso/components/data/query-products-list';
import EmptyContent from 'calypso/components/empty-content';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import { getProductsList } from 'calypso/state/products-list/selectors';
import isSiteUpgradeable from 'calypso/state/selectors/is-site-upgradeable';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import SiteRedirectStep from './site-redirect-step';

class SiteRedirect extends Component {
	static propTypes = {
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
		this.checkSiteIsUpgradeable();
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.selectedSiteId !== this.props.selectedSiteId ) {
			this.checkSiteIsUpgradeable();
		}
	}

	checkSiteIsUpgradeable() {
		if ( ! this.props.isSiteUpgradeable ) {
			page.redirect( '/domains/add' );
		}
	}

	render() {
		const {
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

				{ selectedSite && (
					<SiteRedirectStep products={ productsList } selectedSite={ selectedSite } />
				) }
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
