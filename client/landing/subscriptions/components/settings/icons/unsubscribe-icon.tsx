import { Icon, close } from '@wordpress/icons';

interface UnsubscribeIconProps {
	className?: string;
}

export default function UnsubscribeIcon( props: UnsubscribeIconProps ): JSX.Element {
	const { className } = props;

	return <Icon className={ className } icon={ close } />;
}
