function SkeletonCard() {
	return (
		<div class="skeleton-item">
			<div class="skeleton skeleton--image" />
			<div style="padding: 12px 16px;">
				<div class="skeleton skeleton--text skeleton--full" />
				<div class="skeleton skeleton--text skeleton--medium" />
				<div class="skeleton-item__footer">
					<div class="skeleton skeleton--circle-sm" />
					<div class="skeleton skeleton--text skeleton--short" />
				</div>
			</div>
		</div>
	);
}

export function Loading() {
	return (
		<div class="post-feed">
			<div class="post-feed__grid">
				<SkeletonCard />
				<SkeletonCard />
				<SkeletonCard />
				<SkeletonCard />
				<SkeletonCard />
				<SkeletonCard />
				<SkeletonCard />
				<SkeletonCard />
			</div>
		</div>
	);
}
