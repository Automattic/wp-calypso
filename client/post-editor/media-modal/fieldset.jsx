var PropTypes = require('prop-types');
/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );

module.exports = React.createClass( {
	displayName: 'EditorMediaModalFieldset',

	propTypes: {
		legend: PropTypes.oneOfType( [
			PropTypes.string,
			PropTypes.element
		] ).isRequired
	},

	render: function() {
		return (
			<fieldset className={ classNames( 'editor-media-modal__fieldset', this.props.className ) }>
				<legend className="editor-media-modal__fieldset-legend">{ this.props.legend }</legend>
				{ this.props.children }
			</fieldset>
		);
	}
} );
