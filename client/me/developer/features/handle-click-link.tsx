import { recordTracksEvent } from '@automattic/calypso-analytics';

export const handleClickLink = ( event: React.MouseEvent< HTMLAnchorElement > ) => {
	const prefixToRemove = '/support';
	const pathIndex = event.currentTarget.href.indexOf( prefixToRemove );

	let title = event.currentTarget.href;
	if ( pathIndex !== -1 ) {
		title = title.substring( pathIndex + prefixToRemove.length );
	}

	recordTracksEvent( 'calypso_me_developer_learn_more', { feature: title } );
};
