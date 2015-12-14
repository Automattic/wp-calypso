/**
 * External dependencies
 */
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import omit from 'lodash/object/omit';

/**
 * Internal dependencies
 */
import { fetchCurrentTheme } from 'lib/themes/actions';
import { getCurrentTheme } from 'lib/themes/selectors';

function getState( state, { site } ) {
	return {
		currentTheme: getCurrentTheme( state, site.ID )
	};
}

/**
 * Fetches the currently active theme of the supplied site
 * and passes it to the supplied child component.
 */
const CurrentThemeData = React.createClass( {

	propTypes: {
		site: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired,
		currentTheme: React.PropTypes.shape( {
			name: React.PropTypes.string,
			id: React.PropTypes.string
		} ),
		fetchCurrentTheme: React.PropTypes.func.isRequired,
		children: React.PropTypes.element.isRequired,
	},

	componentDidMount() {
		this.refresh( this.props );
	},

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.site && nextProps.site !== this.props.site ) {
			this.refresh( nextProps );
		}
	},

	refresh( props ) {
		if ( ! this.props.currentTheme && props.site ) {
			this.props.fetchCurrentTheme( props.site );
		}
	},

	render() {
		return React.cloneElement( this.props.children, omit( this.props, 'children' ) );
	}
} );

export default connect(
	( state, props ) => Object.assign( {},
		props,
		getState( state, props )
	),
	bindActionCreators.bind( null, { fetchCurrentTheme } )
)( CurrentThemeData );
