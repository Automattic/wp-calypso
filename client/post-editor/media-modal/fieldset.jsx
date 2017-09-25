/**
 * External dependencies
 */
import React from 'react';

import classNames from 'classnames';

export default React.createClass( {
	displayName: 'EditorMediaModalFieldset',

	propTypes: {
		legend: React.PropTypes.oneOfType( [
			React.PropTypes.string,
			React.PropTypes.element
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
