/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { fetchThemeDetails } from 'state/themes/actions';
import { getSelectedSiteId } from 'state/ui/selectors';

/**
 * Fetches details for a theme specified by its ID
 * and passes it to the supplied child component.
 */
const QueryThemeDetails = React.createClass( {

	propTypes: {
		id: React.PropTypes.string.isRequired,
	},

	componentDidMount() {
		this.refresh( this.props );
	},

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.id && nextProps.id !== this.props.id ) {
			this.refresh( nextProps );
		}
	},

	refresh( props ) {
		// todo (seear): Don't fetch if site matches existing data
		if ( props.id ) {
			this.props.fetchThemeDetails( props.id, props.selectedSiteId );
		}
	},

	render() {
		return null;
	}
} );

export default connect(
	state => ( {
		selectedSiteId: getSelectedSiteId( state )
	} ),
	{ fetchThemeDetails }
)( QueryThemeDetails );
