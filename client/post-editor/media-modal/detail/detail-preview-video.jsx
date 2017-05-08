/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
const MediaUtils = require( 'lib/media/utils' ),
	EditorMediaModalDetailItemVideoPress = require( './detail-preview-videopress' );

module.exports = React.createClass( {
	displayName: 'EditorMediaModalDetailPreviewVideo',

	propTypes: {
		className: React.PropTypes.string,
		item: React.PropTypes.object.isRequired
	},

	render() {
		if ( MediaUtils.isVideoPressItem( this.props.item ) ) {
			return <EditorMediaModalDetailItemVideoPress { ...this.props } />;
		}

		const classes = classNames( this.props.className, 'is-video' );

		return (
			<video
				src={ MediaUtils.url( this.props.item ) }
				controls
				className={ classes } />
		);
	}
} );
