import Skeleton from 'calypso/reader/components/skeleton';

const PLACEHOLDER_COUNT = 4;

/**
 * Layout-stable placeholder for `<SocialSpotlight>`. Mirrors the strip's
 * eventual layout (header band + grid of cards) so the social-grid below
 * doesn't shift when timeline queries resolve. aria-hidden so screen
 * readers don't announce empty boxes; surrounding live regions cover the
 * loading state.
 */
export function SocialSpotlightSkeleton() {
	return (
		<section className="social-spotlight" aria-hidden="true">
			<header className="social-spotlight__header">
				<Skeleton height="14px" width="80px" />
				<Skeleton className="social-spotlight-skeleton__subtitle" height="14px" width="60%" />
			</header>
			<ul className="social-spotlight__list">
				{ Array.from( { length: PLACEHOLDER_COUNT } ).map( ( _, index ) => (
					<li key={ index } className="social-spotlight__card social-spotlight-skeleton__card">
						<div className="social-spotlight__link">
							<div className="social-spotlight__card-header">
								<Skeleton height="32px" width="32px" shape="circle" />
								<div className="social-spotlight-skeleton__author">
									<Skeleton height="12px" width="60%" />
									<Skeleton height="10px" width="40%" />
								</div>
							</div>
							<div className="social-spotlight-skeleton__text">
								<Skeleton height="10px" width="100%" />
								<Skeleton height="10px" width="95%" />
								<Skeleton height="10px" width="70%" />
							</div>
							<div className="social-spotlight-skeleton__counts">
								<Skeleton height="10px" width="40px" />
								<Skeleton height="10px" width="40px" />
							</div>
						</div>
					</li>
				) ) }
			</ul>
		</section>
	);
}
