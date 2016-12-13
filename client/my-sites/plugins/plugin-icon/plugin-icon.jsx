/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import Gridicon from 'components/gridicon';

const PluginIcon = ( { className, image, isPlaceholder } ) => {
	const classes = classNames( {
		'plugin-icon': true,
		'is-placeholder': isPlaceholder,
		'is-fallback': ! image,
	}, className );

	return (
		<div className={ classes } >
			{ isPlaceholder || ! image
				? <Gridicon icon="plugins" />
				: <img className="plugin-icon__img" src={ image } />
			}
		</div>
	);
};

PluginIcon.propTypes = {
	image: PropTypes.string,
	isPlaceholder: PropTypes.bool
};

export default PluginIcon;
