/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import find from 'lodash/find';
import { urlToSlug } from 'lib/url';


/**
 * Internal dependencies
 */
import SitesDropdown from 'components/sites-dropdown';

class SitesDropdownExample extends PureComponent {
	static propTypes = {
		selectedSiteId: React.PropTypes.number
	}

	constructor( props ) {
		super( props );

		this.state = {
			selectedSiteId: this.props.selectedSiteId
		};
	}

	updateSelectedSite = ( siteSlug ) => {
		const selectedSite = find( this.props.sites, site => urlToSlug( site.URL ) === siteSlug );
		if ( selectedSite ) {
			this.setState( { selectedSiteId: selectedSite.ID } );
		}
	}

	render(){
		return (
			<SitesDropdown
				selectedSiteId={ this.state.selectedSiteId }
				onSiteSelect={ this.updateSelectedSite } />
		);
	}
}

const getAllSites = ( state ) => state.sites.items;

const getFirstSiteId = ( state ) => Object.keys( state.sites.items )[ 0 ];

const ConnectedSitesDropdownExample = connect( ( state ) => ( {
	sites: getAllSites( state ),
	selectedSiteId: getFirstSiteId( state )
} ) )( SitesDropdownExample );

ConnectedSitesDropdownExample.displayName = 'SitesDropdown'

export default ConnectedSitesDropdownExample;
