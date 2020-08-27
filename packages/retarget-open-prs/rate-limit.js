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
};
