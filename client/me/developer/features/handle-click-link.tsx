import { enhanceWithUserIsDevAccount, recordTracksEvent } from 'calypso/state/analytics/actions';
import { withEnhancers } from 'calypso/state/utils';
import type { Dispatch } from 'redux';

export const handleClickLink = (
	dispatch: Dispatch,
	event: React.MouseEvent< HTMLAnchorElement >
) => {
	const prefixToRemove = '/support/';
	const pathIndex = event.currentTarget.href.indexOf( prefixToRemove );

	let featureSlug = event.currentTarget.href;
	if ( pathIndex !== -1 ) {
		featureSlug = featureSlug.substring( pathIndex + prefixToRemove.length );
	}

	const recordEvent = withEnhancers( recordTracksEvent, enhanceWithUserIsDevAccount );

	dispatch( recordEvent( 'calypso_me_developer_learn_more', { feature: featureSlug } ) );
};
