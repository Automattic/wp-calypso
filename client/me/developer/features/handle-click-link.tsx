import { recordTracksEvent } from '@automattic/calypso-analytics';
import { enhanceWithIsDevAccount } from 'calypso/state/analytics/actions';
import { withEnhancers } from 'calypso/state/utils';

export const handleClickLink = ( event: React.MouseEvent< HTMLAnchorElement > ) => {
	const prefixToRemove = '/support/';
	const pathIndex = event.currentTarget.href.indexOf( prefixToRemove );

	let featureSlug = event.currentTarget.href;
	if ( pathIndex !== -1 ) {
		featureSlug = featureSlug.substring( pathIndex + prefixToRemove.length );
	}

	const recorder = withEnhancers( recordTracksEvent, [ enhanceWithIsDevAccount ] );

	recorder( 'calypso_me_developer_learn_more', { feature: featureSlug } );
};
