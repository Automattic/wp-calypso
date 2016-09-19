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
			this.props.fetchThemeDetails( props.id, props.siteId );
		}
	},

	render() {
		return null;
	}
} );

export default connect(
	null,
	{ fetchThemeDetails }
)( QueryThemeDetails );
