export function bumpStatGenerator( type, name, bumpStat ) {
	return () => {
		let group;
		if ( type !== 'page' && type !== 'post' ) {
			group = 'calypso_cpt_actions';
		} else {
			group = 'calypso_' + type + '_actions';
		}
		bumpStat( group, name );
	};
}
