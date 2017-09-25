/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import MediaUtils from 'lib/media/utils';

export default React.createClass( {
	displayName: 'EditorMediaModalDetailPreviewAudio',

	propTypes: {
		className: PropTypes.string,
		item: PropTypes.object.isRequired
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
