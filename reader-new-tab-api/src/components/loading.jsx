function SkeletonItem() {
	return (
		<div class="skeleton-item">
			<div class="skeleton-item__header">
				<div class="skeleton skeleton--circle" />
				<div class="skeleton-item__meta">
					<div class="skeleton skeleton--text skeleton--short" />
					<div class="skeleton skeleton--text skeleton--shorter" />
				</div>
			</div>
			<div class="skeleton skeleton--text skeleton--full" />
			<div class="skeleton skeleton--text skeleton--medium" />
		</div>
	);
}

export function Loading() {
	return (
		<div class="post-feed">
			<div class="post-feed__header">
				<h2 class="post-feed__title">Recent</h2>
				<p class="post-feed__subtitle">Latest from your subscriptions.</p>
			</div>
			<div class="post-feed__list">
				<SkeletonItem />
				<SkeletonItem />
				<SkeletonItem />
				<SkeletonItem />
				<SkeletonItem />
			</div>
		</div>
	);
}
