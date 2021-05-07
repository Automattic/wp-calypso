const setTracksUser = ( client ) =>
	client
		.me()
		.get( { fields: 'ID,username' } )
		.then( ( { ID, username } ) => {
			window._tkq = window._tkq || [];
			window._tkq.push( [ 'identifyUser', ID, username ] );
		} )
		.catch( () => {} );

export default setTracksUser;
