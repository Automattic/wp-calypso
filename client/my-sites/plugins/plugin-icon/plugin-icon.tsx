import { Gridicon } from '@automattic/components';
import clsx from 'clsx';

import './style.scss';

interface PluginIconProps {
	className?: string;
	image?: string;
	isPlaceholder?: boolean;
}

const PluginIcon = ( { className, image, isPlaceholder }: PluginIconProps ) => {
	const classes = clsx(
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

export default PluginIcon;
