import page from '@automattic/calypso-router';
import BackButton from 'calypso/components/back-button';

interface AuthorProfileHeaderProps {
	// Pre-built URL the back button navigates to when there is no prior
	// browser history (the deep-link case). The protocol shell is
	// responsible for constructing the timeline URL — this component is
	// protocol-agnostic.
	timelineUrl: string;
	onBackToTimeline?: () => void;
}

// BackButton shim used by both atmosphere and mastodon profile views. Prefers
// `window.history.back()` so a user who navigated here via an in-app click
// (timeline → profile, or profile → profile via a bio @-mention) returns to
// the previous view. Falls back to `page(timelineUrl)` when `history.length`
// is 1 (a freshly-loaded tab opened directly on the profile URL) so deep-
// linked users still land somewhere instead of getting a no-op back.
// The panel owns the Tracks dispatch via the optional onBackToTimeline
// callback. SocialProfileCard renders the display-name heading inside the
// panel body — no heading lives here.
export function AuthorProfileHeader( { timelineUrl, onBackToTimeline }: AuthorProfileHeaderProps ) {
	return (
		<BackButton
			onClick={ () => {
				onBackToTimeline?.();
				if ( window.history.length > 1 ) {
					window.history.back();
					return;
				}
				page( timelineUrl );
			} }
		/>
	);
}
