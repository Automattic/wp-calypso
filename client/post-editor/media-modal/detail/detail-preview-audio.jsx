/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import MediaUtils from 'lib/media/utils';

module.exports = React.createClass( {
	displayName: 'EditorMediaModalDetailPreviewAudio',

	propTypes: {
		className: React.PropTypes.string,
		item: React.PropTypes.object.isRequired
	},

	render: function() {
		const classes = classNames( this.props.className, 'is-audio' );

		return (
			<audio
				src={ MediaUtils.url( this.props.item ) }
				controls
				className={ classes } />
		);
	}
} );
