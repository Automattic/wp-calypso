import Skeleton from 'calypso/reader/components/skeleton';

export function FeedListSkeleton() {
	return (
		<div className="social-feed-list-skeleton">
			{ [ 0, 1, 2 ].map( ( i ) => (
				<div key={ i } className="social-feed-list-skeleton__row">
					<Skeleton height="40px" width="40px" shape="circle" />
					<div className="social-feed-list-skeleton__row-body">
						<Skeleton height="16px" width="40%" />
						<Skeleton height="14px" width="100%" />
						<Skeleton height="14px" width="80%" />
					</div>
				</div>
			) ) }
		</div>
	);
}
