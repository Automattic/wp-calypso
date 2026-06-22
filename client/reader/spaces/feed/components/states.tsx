import { Button, Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

/** Shown while the first page of the stream loads. */
export function SpaceFeedLoading() {
	const translate = useTranslate();
	return (
		<div className="space-feed__status" role="status">
			<Spinner />
			<span>{ translate( 'Loading the feed…' ) }</span>
		</div>
	);
}

/** Skeleton shown at the foot of the list while the next page loads. */
export function SpaceFeedLoadingMore() {
	const translate = useTranslate();
	return (
		<div className="space-feed__loading-more" role="status" aria-busy="true">
			<span className="screen-reader-text">{ translate( 'Loading more posts…' ) }</span>
			{ [ 0, 1 ].map( ( index ) => (
				<div className="space-feed__skeleton-row" key={ index } aria-hidden="true">
					<span className="space-feed__skeleton-avatar" />
					<span className="space-feed__skeleton-body">
						<span className="space-feed__skeleton-line" />
						<span className="space-feed__skeleton-line is-short" />
					</span>
				</div>
			) ) }
		</div>
	);
}

/** Shown when the stream has loaded but holds no posts. */
export function SpaceFeedEmpty() {
	const translate = useTranslate();
	return (
		<div className="space-feed__status">
			<p className="space-feed__status-title">{ translate( 'Nothing here yet' ) }</p>
			<p className="space-feed__status-line">
				{ translate( 'Posts from this space’s sources will show up here.' ) }
			</p>
		</div>
	);
}

/** Shown when the stream request fails; offers a retry. */
export function SpaceFeedError( { onRetry }: { onRetry: () => void } ) {
	const translate = useTranslate();
	return (
		<div className="space-feed__status">
			<p className="space-feed__status-title">{ translate( 'Couldn’t load this feed' ) }</p>
			<Button variant="secondary" onClick={ onRetry }>
				{ translate( 'Try again' ) }
			</Button>
		</div>
	);
}
