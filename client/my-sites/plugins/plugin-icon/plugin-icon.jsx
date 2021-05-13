/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import Gridicon from 'calypso/components/gridicon';

/**
 * Style dependencies
 */
import './style.scss';

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
				<Gridicon icon="plugins" />
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
