/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import DomainsStore from 'lib/domains/store';
import NameserversStore from 'lib/domains/nameservers/store';
import StoreConnection from 'components/data/store-connection';
import { fetchDomains, fetchNameservers } from 'lib/upgrades/actions';
import { getSelectedSite } from 'state/ui/selectors';

const stores = [
	DomainsStore,
	NameserversStore
];

function getStateFromStores( props ) {
	let domains;

	if ( props.selectedSite ) {
		domains = DomainsStore.getBySite( props.selectedSite.ID );
	}

	return {
		domains,
		nameservers: NameserversStore.getByDomainName( props.selectedDomainName ),
		selectedDomainName: props.selectedDomainName,
		selectedSite: props.selectedSite
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

		if ( props.selectedSite ) {
			this.loadDomains( props.selectedSite.ID );
		}

		this.loadNameservers();
	}

	componentWillUpdate( nextProps ) {
		const { selectedSite: nextSite } = nextProps;
		const { selectedSite: prevSite } = this.props;

		if ( nextSite && nextSite !== prevSite ) {
			this.loadDomains( nextSite.ID );
		}

		this.loadNameservers();
	}

	loadDomains = siteId => fetchDomains( siteId );
	loadNameservers = () => fetchNameservers( this.props.selectedDomainName );

	render() {
		return (
			<StoreConnection
				component={ this.props.component }
				stores={ stores }
				getStateFromStores={ getStateFromStores }
				selectedDomainName={ this.props.selectedDomainName }
				selectedSite={ this.props.selectedSite }
			/>
		);
	}
}

const mapStateToProps = state => ( {
	selectedSite: getSelectedSite( state ),
} );

export default connect( mapStateToProps )( NameserversData );
