import { Icon, seen } from '@wordpress/icons';

interface ViewFeedIconProps {
	className?: string;
}

export default function ViewFeedIcon( props: ViewFeedIconProps ): JSX.Element {
	const { className } = props;

	return <Icon className={ className } icon={ seen } />;
}
