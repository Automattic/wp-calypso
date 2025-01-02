import { Gridicon } from '@automattic/components';
import clsx from 'clsx';

import './style.scss';

interface PluginIconProps {
	className?: string;
	image?: string;
	isPlaceholder?: boolean;
	size?: number;
}

const PluginIcon = ( { className, image, isPlaceholder, size = 48 }: PluginIconProps ) => {
	const classes = clsx(
		{
			'plugin-icon': true,
			'is-placeholder': isPlaceholder,
			'is-fallback': ! image,
		},
		className
	);

	const style = {
		width: size,
		height: size,
	};

	return (
		<div className={ classes } style={ style }>
			{ isPlaceholder || ! image ? (
				<Gridicon icon="plugins" size={ size } />
			) : (
				<img className="plugin-icon__img" src={ image } alt="plugin-icon" style={ style } />
			) }
		</div>
	);
};

export default PluginIcon;
