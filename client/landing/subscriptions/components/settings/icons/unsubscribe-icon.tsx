import { Icon, close } from '@wordpress/icons';
import type { JSX } from 'react';

interface UnsubscribeIconProps {
	className?: string;
	iconSize?: number;
}

export default function UnsubscribeIcon( props: UnsubscribeIconProps ): JSX.Element {
	const { className, iconSize } = props;

	return <Icon className={ className } icon={ close } size={ iconSize || 20 } />;
}
