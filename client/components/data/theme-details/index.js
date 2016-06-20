/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import omit from 'lodash/omit';

/**
 * Internal dependencies
 */
import { fetchThemeDetails } from 'state/themes/actions';
import { getThemeDetails } from 'state/themes/theme-details/selectors';

/**
 * Fetches details for a theme specified by its ID
 * and passes it to the supplied child component.
 */
const ThemeDetailsData = React.createClass( {

	propTypes: {
		children: React.PropTypes.element.isRequired,
		id: React.PropTypes.string.isRequired,
		site: React.PropTypes.string,
		// Connected props
		name: React.PropTypes.string,
		author: React.PropTypes.string,
		screenshot: React.PropTypes.string,
		description: React.PropTypes.string,
		descriptionLong: React.PropTypes.string,
		supportDocumentation: React.PropTypes.string,
		fetchThemeDetails: React.PropTypes.func.isRequired
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
			this.props.fetchThemeDetails( props.id, props.site );
		}
	},

	render() {
		return React.cloneElement( this.props.children, omit( this.props, 'children' ) );
	}
} );

export default connect(
	( state, props ) => getThemeDetails( state, props.id ),
	{ fetchThemeDetails }
)( ThemeDetailsData );
