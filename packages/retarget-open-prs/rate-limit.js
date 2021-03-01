module.exports = {
	isHittingRateLimit( { remainingRateLimit } ) {
		return remainingRateLimit === 0;
	},

	warnOfRateLimit( { rateLimitReset } ) {
		const rateLimitResetDate = new Date( rateLimitReset * 1000 );
		// eslint-disable-next-line no-console
		console.error(
			`Hit rate limit. Wait until ${ rateLimitResetDate } and then run the command again.`
		);
	},

	sleepUntilRateLimitOver( { rateLimitReset } ) {
		const sleepUntil = rateLimitReset * 1000;
		return new Promise( ( resolve ) => {
			const interval = setInterval( () => {
				const timeLeft = ( sleepUntil - Date.now() ) / 1000;
				// eslint-disable-next-line no-console
				console.log( `${ timeLeft } seconds left until rate limit is reset. Sleeping...` );
			}, 1000 );
			setTimeout( () => {
				clearInterval( interval );
				resolve();
			}, rateLimitReset );
		} );
	},
};
