/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import NameserversStore from 'lib/domains/nameservers/store';
import QuerySiteDomains from 'components/data/query-site-domains';
import StoreConnection from 'components/data/store-connection';
import { fetchNameservers } from 'lib/upgrades/actions';
import { getDomainsBySite } from 'state/sites/domains/selectors';
import { getSelectedSite } from 'state/ui/selectors';

const stores = [
	NameserversStore
];

function getStateFromStores( props ) {
	return {
		domains: props.domains,
		nameservers: NameserversStore.getByDomainName( props.selectedDomainName ),
		selectedDomainName: props.selectedDomainName,
		// undefined is not permitted by the passed component
		// so we have to explicitly choose a bool in that case
		selectedSite: props.selectedSite || false,
	};
}

export class NameserversData extends Component {
	static propTypes = {
		component: PropTypes.func.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.object,
	};

	constructor( props ) {
		super( props );

		this.loadNameservers();
	}

	componentWillUpdate() {
		this.loadNameservers();
	}

	loadNameservers = () => fetchNameservers( this.props.selectedDomainName );

	render() {
		const { selectedSite } = this.props;

		return (
			<div>
				<QuerySiteDomains siteId={ selectedSite && selectedSite.ID } />
				<StoreConnection
					component={ this.props.component }
					domains={ this.props.domains }
					stores={ stores }
					getStateFromStores={ getStateFromStores }
					selectedDomainName={ this.props.selectedDomainName }
					selectedSite={ selectedSite }
				/>
			</div>
		);
	}
}

const mapStateToProps = state => {
	const selectedSite = getSelectedSite( state );
	const domains = getDomainsBySite( state, selectedSite );

	return {
		domains: {
			// this doesn't appear to be currently
			// stored in our app state as it was in
			// the domains store. we know if we are
			// currently fetching, but not if a fetch
			// has taken place. in this case, I'm
			// using the length of the array to indicate
			// `hasLoaded` because this component should
			// never exist in the app without at least
			// one domain. thus, if we have at least one
			// then we have loaded them.
			hasLoadedFromServer: !! domains.length,
			list: domains,
		},
		selectedSite
	};
};

export default connect( mapStateToProps )( NameserversData );
