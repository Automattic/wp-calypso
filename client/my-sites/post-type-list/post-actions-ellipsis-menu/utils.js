export function bumpStatGenerator( type, name, bumpStat, recordTracksEvent = null ) {
	return () => {
		let group;
		if ( ! type ) {
			group = 'calypso_unknown_type_actions';
		} else if ( type !== 'page' && type !== 'post' ) {
			group = 'calypso_cpt_actions';
		} else {
			group = 'calypso_' + type + '_actions';
		}
		bumpStat( group, name );
		if ( recordTracksEvent ) {
			recordTracksEvent( 'calypso_post_list_action_click', {
				action: name,
				post_type: type,
				context: 'ellipsis_menu',
			} );
		}
	};
}
