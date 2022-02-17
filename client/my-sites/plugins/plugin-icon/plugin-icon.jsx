import { Gridicon } from '@automattic/components';
import classNames from 'classnames';
import PropTypes from 'prop-types';

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
				<img className="plugin-icon__img" src={ image } alt="plugin-icon" />
			) }
		</div>
	);
};

PluginIcon.propTypes = {
	image: PropTypes.string,
	isPlaceholder: PropTypes.bool,
	className: PropTypes.string,
};

export default PluginIcon;
