import { recordTracksEvent } from '@automattic/calypso-analytics';

export const handleClickLink = ( event: React.MouseEvent< HTMLAnchorElement > ) => {
	const prefixToRemove = '/support/';
	const pathIndex = event.currentTarget.href.indexOf( prefixToRemove );

	let featureSlug = event.currentTarget.href;
	if ( pathIndex !== -1 ) {
		featureSlug = featureSlug.substring( pathIndex + prefixToRemove.length );
	}

	recordTracksEvent( 'calypso_me_developer_learn_more', { feature: featureSlug } );
};
