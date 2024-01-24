import { recordTracksEvent } from '@automattic/calypso-analytics';

export const handleClickLink = ( title: string ) => {
	recordTracksEvent( 'calypso_me_developer_learn_more', { feature: title } );
};
