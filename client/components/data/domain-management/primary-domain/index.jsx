/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import QuerySiteDomains from 'components/data/query-site-domains';
import { getDomainsBySite } from 'state/sites/domains/selectors';
import { getSelectedSite } from 'state/ui/selectors';

export class PrimaryDomainData extends Component {
	static propTypes = {
		component: PropTypes.func.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.object,
	};

	render() {
		const {
			component: SubComponent,
			domains,
			selectedDomainName,
			selectedSite,
		} = this.props;

		return (
			<div>
				<QuerySiteDomains siteId={ selectedSite && selectedSite.ID } />
				<SubComponent { ...{ domains, selectedDomainName, selectedSite } } />
			</div>
		);
	}
}

const mapStateToProps = state => {
	const selectedSite = getSelectedSite( state );

	return {
		domains: getDomainsBySite( state, selectedSite ),
		selectedSite: getSelectedSite( state ),
	};
};

export default connect( mapStateToProps )( PrimaryDomainData );
