// Protocol-agnostic profile-header placeholder. Mirrors SocialProfileCard's
// layout (banner band → avatar → display name → handle → stats) so the
// surface stays layout-stable when profile data resolves. aria-hidden so
// screen readers don't announce empty placeholder blocks; the panel-level
// loading state is announced through the surrounding aria-live region.
export function SocialProfileHeaderSkeleton() {
	return (
		<div className="social-profile-card-skeleton" aria-hidden="true">
			<div className="social-profile-card-skeleton__banner" />
			<div className="social-profile-card-skeleton__header-row">
				<div className="social-profile-card-skeleton__avatar" />
			</div>
			<div className="social-profile-card-skeleton__name" />
			<div className="social-profile-card-skeleton__handle" />
			<div className="social-profile-card-skeleton__stats">
				<div className="social-profile-card-skeleton__stat" />
				<div className="social-profile-card-skeleton__stat" />
				<div className="social-profile-card-skeleton__stat" />
			</div>
		</div>
	);
}
