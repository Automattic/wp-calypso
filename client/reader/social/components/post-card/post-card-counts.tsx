import { __experimentalHStack as HStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import type { AtmosphereCounts } from '@automattic/api-core';

interface PostCardCountsProps {
	counts: AtmosphereCounts;
}

export function PostCardCounts( { counts }: PostCardCountsProps ) {
	const translate = useTranslate();
	return (
		<HStack
			alignment="center"
			spacing={ 4 }
			justify="flex-start"
			className="social-post-card-counts"
		>
			<span aria-label={ translate( 'Replies' ) }>💬 { counts.replies }</span>
			<span aria-label={ translate( 'Reposts' ) }>🔁 { counts.reposts }</span>
			<span aria-label={ translate( 'Likes' ) }>♥ { counts.likes }</span>
			<span aria-label={ translate( 'Quotes' ) }>📎 { counts.quotes }</span>
		</HStack>
	);
}
