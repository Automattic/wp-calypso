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

/** Shown when the stream has loaded but holds no posts. Copy differs per variant. */
export function SpaceFeedEmpty( {
	variant = 'feed',
	onAddSources,
}: {
	variant?: 'feed' | 'discover';
	onAddSources?: () => void;
} ) {
	const translate = useTranslate();

	if ( variant === 'discover' ) {
		return (
			<div className="space-feed__status">
				<p className="space-feed__status-title">{ translate( 'Nothing here yet' ) }</p>
				<p className="space-feed__status-line">
					{ translate( 'On-topic posts you don’t already follow will show up here.' ) }
				</p>
			</div>
		);
	}

	return (
		<div className="space-feed__status">
			<p className="space-feed__status-title">{ translate( 'Add sources to get started' ) }</p>
			<p className="space-feed__status-line">
				{ translate( 'Follow blogs, tags, or sites to fill this space with posts you’ll love.' ) }
			</p>
			{ onAddSources && (
				<Button variant="primary" onClick={ onAddSources }>
					{ translate( 'Add sources' ) }
				</Button>
			) }
		</div>
	);
}

/** Shown when the stream request fails; offers a retry. */
export function SpaceFeedError( { onRetry }: { onRetry: () => void } ) {
	const translate = useTranslate();
	return (
		// `role="alert"` so the failure is announced when it replaces the loading region.
		<div className="space-feed__status" role="alert">
			<p className="space-feed__status-title">{ translate( 'Couldn’t load this feed' ) }</p>
			<Button variant="secondary" onClick={ onRetry }>
				{ translate( 'Try again' ) }
			</Button>
		</div>
	);
}
