/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import GridiconPlugins from 'gridicons/dist/plugins';

const PluginIcon = ( { className, image, isPlaceholder } ) => {
	const classes = classNames(
		{
			'plugin-icon': true,
			'is-placeholder': isPlaceholder,
			'is-fallback': ! image,
		},
		className
	);

	return (
		<div className={ classes }>
			{ isPlaceholder || ! image ? (
				<GridiconPlugins />
			) : (
				<img className="plugin-icon__img" src={ image } />
			) }
		</div>
	);
};

PluginIcon.propTypes = {
	image: PropTypes.string,
	isPlaceholder: PropTypes.bool,
};

export default PluginIcon;
