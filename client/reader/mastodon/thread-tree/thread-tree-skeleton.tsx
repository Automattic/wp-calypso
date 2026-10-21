import { useTranslate } from 'i18n-calypso';
import Skeleton from 'calypso/reader/components/skeleton';

export function MastodonThreadTreeSkeleton() {
	const translate = useTranslate();
	return (
		<div
			role="status"
			// `aria-busy` lets assistive tech know the region is in flight
			// without re-announcing the SR-only "Loading thread" copy on
			// every refetch — `aria-live` would speak each remount.
			aria-busy="true"
			className="thread-tree-skeleton"
		>
			<span className="screen-reader-text">{ translate( 'Loading thread' ) }</span>
			<div className="thread-tree-skeleton__row thread-tree-skeleton__row--large">
				<Skeleton width="64px" height="64px" shape="circle" />
				<div className="thread-tree-skeleton__lines">
					<Skeleton width="40%" height="14px" />
					<Skeleton width="80%" height="14px" />
					<Skeleton width="60%" height="14px" />
				</div>
			</div>
			<div className="thread-tree-skeleton__row">
				<Skeleton width="40px" height="40px" shape="circle" />
				<div className="thread-tree-skeleton__lines">
					<Skeleton width="30%" height="12px" />
					<Skeleton width="70%" height="12px" />
				</div>
			</div>
			<div className="thread-tree-skeleton__row">
				<Skeleton width="40px" height="40px" shape="circle" />
				<div className="thread-tree-skeleton__lines">
					<Skeleton width="30%" height="12px" />
					<Skeleton width="70%" height="12px" />
				</div>
			</div>
		</div>
	);
}
