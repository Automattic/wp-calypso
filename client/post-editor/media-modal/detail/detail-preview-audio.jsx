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

module.exports = class extends React.Component {
    static displayName = 'EditorMediaModalDetailPreviewAudio';

	static propTypes = {
		className: PropTypes.string,
		item: PropTypes.object.isRequired
	};

	render() {
		const classes = classNames( this.props.className, 'is-audio' );

		return (
			<audio
				src={ MediaUtils.url( this.props.item ) }
				controls
				className={ classes } />
		);
	}
};
