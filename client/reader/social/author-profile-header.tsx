import page from '@automattic/calypso-router';
import BackButton from 'calypso/components/back-button';

interface AuthorProfileHeaderProps {
	// Pre-built URL the back button navigates to. The protocol shell is
	// responsible for constructing the timeline URL — this component is
	// protocol-agnostic.
	timelineUrl: string;
	onBackToTimeline?: () => void;
}

// Mirrors slice-5's ThreadHeader: just a BackButton that always navigates to
// the timeline (not page.back()) so deep-linked users land somewhere. The
// panel owns the Tracks dispatch via the optional onBackToTimeline callback.
// SocialProfileCard renders the display-name heading inside the panel body —
// no heading lives here.
export function AuthorProfileHeader( { timelineUrl, onBackToTimeline }: AuthorProfileHeaderProps ) {
	return (
		<BackButton
			onClick={ () => {
				onBackToTimeline?.();
				page( timelineUrl );
			} }
		/>
	);
}
