import { Icon, plus } from '@wordpress/icons';

interface ReaderFollowFeedIconProps {
	iconSize: number;
}

export default function ReaderFollowFeedIcon( props: ReaderFollowFeedIconProps ): JSX.Element {
	const { iconSize } = props;

	return (
		<Icon
			key="follow"
			className="reader-follow-feed"
			viewBox="0 0 20 20"
			icon={ plus }
			width={ iconSize }
			height={ iconSize }
		/>
	);
}
