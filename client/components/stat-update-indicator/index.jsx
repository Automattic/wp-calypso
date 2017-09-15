var PropTypes = require('prop-types');
/**
 * External dependencies
 */

var React = require( 'react' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var StatUpdateIndicator = React.createClass( {

	propTypes: {
		children: PropTypes.node.isRequired,
		updateOn: PropTypes.oneOfType( [
			PropTypes.string,
			PropTypes.number,
			PropTypes.bool
		] ).isRequired
	},

	getInitialState: function() {
		return {
			updating: ! this.props.updateOn
		};
	},

	componentDidMount: function() {
		this.clearTheUpdate();
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( this.props.updateOn !== nextProps.updateOn ) {
			clearTimeout( this.clearingUpdateTimeout );

			this.setState( {
				updating: true
			} );
			this.clearTheUpdate();
		}
	},

	clearTheUpdate: function() {
		clearTimeout( this.clearingUpdateTimeout );

		this.clearingUpdateTimeout = setTimeout( function() {
			if ( ! this.isMounted() ) {
				return;
			}

			this.setState( {
				updating: false
			} );				
		}.bind( this ), 800 );
	},

	render: function() {
		var className = classNames( {
				'stat-update-indicator': true,
				'is-updating': this.state.updating
			} );

		return (
			<span className={ className }>{ this.props.children }</span>
		);
	}
} );

module.exports = StatUpdateIndicator;
