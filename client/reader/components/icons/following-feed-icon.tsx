import { Icon, published } from '@wordpress/icons';

interface ReaderFollowingFeedIconProps {
	iconSize: number;
}

export default function ReaderFollowingFeedIcon(
	props: ReaderFollowingFeedIconProps
): JSX.Element {
	const { iconSize } = props;

	return (
		<Icon key="following" className="reader-following-feed" icon={ published } size={ iconSize } />
	);
}
