/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );

module.exports = React.createClass( {
	displayName: 'EditorMediaModalFieldset',

	propTypes: {
		legend: React.PropTypes.oneOfType( [
			React.PropTypes.string,
			React.PropTypes.element
		] ).isRequired
	},

	render: function() {
		return (
			<fieldset className={ classNames( 'media-modal__fieldset', this.props.className ) }>
				<legend className="media-modal__fieldset-legend">{ this.props.legend }</legend>
				{ this.props.children }
			</fieldset>
		);
	}
} );
