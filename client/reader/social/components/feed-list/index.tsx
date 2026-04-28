import './style.scss';

import { Spinner, __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { FeedListEmpty } from './feed-list-empty';
import { FeedListSkeleton } from './feed-list-skeleton';
import type { AtmosphereError } from '@automattic/api-core';
import type { ReactElement } from 'react';

interface SocialFeedListProps< T > {
	items: T[];
	isPending: boolean;
	isError: boolean;
	error: AtmosphereError | null;
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	fetchNextPage: () => void;
	refetch: () => void;
	renderItem: ( item: T ) => ReactElement;
	itemKey: ( item: T ) => string;
	emptyTitle: string;
	emptyLine: string;
	emptyActionLabel?: string;
	emptyActionURL?: string;
}

export function SocialFeedList< T >( props: SocialFeedListProps< T > ) {
	const {
		items,
		isPending,
		isError,
		error,
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
		refetch,
		renderItem,
		itemKey,
		emptyTitle,
		emptyLine,
		emptyActionLabel,
		emptyActionURL,
	} = props;

	const translate = useTranslate();
	const { ref, inView } = useInView();

	useEffect( () => {
		if ( inView && hasNextPage && ! isFetchingNextPage ) {
			fetchNextPage();
		}
	}, [ inView, hasNextPage, isFetchingNextPage, fetchNextPage ] );

	if ( isPending ) {
		return <FeedListSkeleton />;
	}

	if ( isError ) {
		return (
			<FeedListEmpty
				error={ error }
				onRetry={ refetch }
				emptyTitle={ emptyTitle }
				emptyLine={ emptyLine }
			/>
		);
	}

	if ( items.length === 0 ) {
		return (
			<FeedListEmpty
				error={ null }
				onRetry={ refetch }
				emptyTitle={ emptyTitle }
				emptyLine={ emptyLine }
				emptyActionLabel={ emptyActionLabel }
				emptyActionURL={ emptyActionURL }
			/>
		);
	}

	return (
		<VStack spacing={ 0 } className="social-feed-list">
			{ items.map( ( item ) => (
				<div key={ itemKey( item ) } className="social-feed-list__item">
					{ renderItem( item ) }
				</div>
			) ) }
			<div ref={ ref } className="social-feed-list__sentinel" role="status" aria-live="polite">
				{ isFetchingNextPage && (
					<>
						<Spinner />
						<span className="screen-reader-text">{ translate( 'Loading more posts' ) }</span>
					</>
				) }
			</div>
		</VStack>
	);
}
