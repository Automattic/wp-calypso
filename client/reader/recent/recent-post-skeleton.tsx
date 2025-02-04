import Skeleton from '../components/skeleton';

const RecentPostSkeleton = () => (
	<div className="recent-post-skeleton">
		<div className="recent-post-skeleton__header">
			<Skeleton height="80px" width="80px" shape="circle" />
			<div className="recent-post-skeleton__header-content">
				<Skeleton height="36px" className="recent-post-skeleton__title" />
				<Skeleton height="36px" width="80%" className="recent-post-skeleton__title" />
				<div className="recent-post-skeleton__header-meta">
					<Skeleton height="24px" width="100px" />
					<Skeleton height="24px" width="100px" />
					<Skeleton height="24px" width="100px" />
				</div>
			</div>
		</div>
		<Skeleton height="400px" className="recent-post-skeleton__img" />
		<div className="recent-post-skeleton__p">
			<Skeleton height="24px" width="100%" />
			<Skeleton height="24px" width="100%" />
			<Skeleton height="24px" width="75%" />
		</div>
		<div className="recent-post-skeleton__p">
			<Skeleton height="24px" width="100%" />
			<Skeleton height="24px" width="100%" />
			<Skeleton height="24px" width="75%" />
		</div>
		<div className="recent-post-skeleton__p">
			<Skeleton height="24px" width="100%" />
			<Skeleton height="24px" width="100%" />
			<Skeleton height="24px" width="75%" />
		</div>
		<div className="recent-post-skeleton__p">
			<Skeleton height="24px" width="100%" />
			<Skeleton height="24px" width="100%" />
			<Skeleton height="24px" width="75%" />
		</div>
	</div>
);

export default RecentPostSkeleton;
