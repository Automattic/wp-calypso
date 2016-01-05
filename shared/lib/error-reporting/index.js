export function setUser() {};

if ( typeof window === 'object' && window.Raven ) {
	setUser = user => {
		window.Raven.setUserContext( {
			id: user.data.ID
		} );
	}
}

export function installErrorReporter( env ) {
	return {
		scriptUrl: 'https://cdn.ravenjs.com/2.0.1/raven.min.js',
		installCode: `
			if ( Raven ) {
				Raven.config( 'https://5bae20cfadc949b48ffd4f96c1900b6c@app.getsentry.com/62683', {
				  whitelistUrls: [/calypso\.localhost/, /wordpress\.com/],
				  tags: {
				  	env: '` + env + `'
				  }
				} ).install();
			}
		`
	}
}
