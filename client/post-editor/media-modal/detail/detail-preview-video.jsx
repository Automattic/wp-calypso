/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import EditorMediaModalDetailItemVideoPress from './detail-preview-videopress';
import MediaUtils from 'lib/media/utils';

export default React.createClass( {
	displayName: 'EditorMediaModalDetailPreviewVideo',

	propTypes: {
		className: PropTypes.string,
		item: PropTypes.object.isRequired
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
