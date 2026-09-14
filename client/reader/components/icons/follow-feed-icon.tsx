import { Icon, plus } from '@wordpress/icons';
import type { JSX } from 'react';

interface ReaderFollowFeedIconProps {
	iconSize: number;
}

export default function ReaderFollowFeedIcon( props: ReaderFollowFeedIconProps ): JSX.Element {
	const { iconSize } = props;

	return <Icon key="follow" className="reader-follow-feed" icon={ plus } size={ iconSize } />;
}
