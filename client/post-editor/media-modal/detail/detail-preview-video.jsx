/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import MediaUtils from 'lib/media/utils';

import EditorMediaModalDetailItemVideoPress from './detail-preview-videopress';

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
