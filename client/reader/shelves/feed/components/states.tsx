import { Button, Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

/** Shown while the first page of the stream loads. */
export function ShelfFeedLoading() {
	const translate = useTranslate();
	return (
		<div className="shelf-feed__status" role="status">
			<Spinner />
			<span>{ translate( 'Loading the feed…' ) }</span>
		</div>
	);
}

/** Skeleton shown at the foot of the list while the next page loads. */
export function ShelfFeedLoadingMore() {
	const translate = useTranslate();
	return (
		<div className="shelf-feed__loading-more" role="status" aria-busy="true">
			<span className="screen-reader-text">{ translate( 'Loading more posts…' ) }</span>
			{ [ 0, 1 ].map( ( index ) => (
				<div className="shelf-feed__skeleton-row" key={ index } aria-hidden="true">
					<span className="shelf-feed__skeleton-avatar" />
					<span className="shelf-feed__skeleton-body">
						<span className="shelf-feed__skeleton-line" />
						<span className="shelf-feed__skeleton-line is-short" />
					</span>
				</div>
			) ) }
		</div>
	);
}

/** Shown when the stream has loaded but holds no posts. Copy differs per variant. */
export function ShelfFeedEmpty( {
	variant = 'feed',
	onAddSources,
}: {
	variant?: 'feed' | 'discover';
	onAddSources?: () => void;
} ) {
	const translate = useTranslate();

	if ( variant === 'discover' ) {
		return (
			<div className="shelf-feed__status">
				<p className="shelf-feed__status-title">{ translate( 'Nothing here yet' ) }</p>
				<p className="shelf-feed__status-line">
					{ translate( 'On-topic posts you don’t already follow will show up here.' ) }
				</p>
			</div>
		);
	}

	return (
		<div className="shelf-feed__status">
			<p className="shelf-feed__status-title">{ translate( 'Add feeds to get started' ) }</p>
			<p className="shelf-feed__status-line">
				{ translate( 'Follow blogs, tags, or sites to fill this shelf with posts you’ll love.' ) }
			</p>
			{ onAddSources && (
				<Button variant="primary" onClick={ onAddSources }>
					{ translate( 'Add feeds' ) }
				</Button>
			) }
		</div>
	);
}

/** Shown when the stream request fails; offers a retry. */
export function ShelfFeedError( { onRetry }: { onRetry: () => void } ) {
	const translate = useTranslate();
	return (
		// `role="alert"` so the failure is announced when it replaces the loading region.
		<div className="shelf-feed__status" role="alert">
			<p className="shelf-feed__status-title">{ translate( 'Couldn’t load this feed' ) }</p>
			<Button variant="secondary" onClick={ onRetry }>
				{ translate( 'Try again' ) }
			</Button>
		</div>
	);
}
