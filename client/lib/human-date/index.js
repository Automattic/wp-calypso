var i18n = require( 'i18n-calypso' );

const MILLIS_IN_MINUTE = 60 * 1000;

module.exports = function humanDate( dateOrMoment ) {
	const now = i18n.moment();
	dateOrMoment = i18n.moment( dateOrMoment );

	let millisAgo = now.diff( dateOrMoment );
	if ( millisAgo < 0 ) {
		millisAgo = 0;
	}

	if ( millisAgo < MILLIS_IN_MINUTE ) {
		let seconds = Math.ceil( millisAgo / 1000 );
		return i18n.translate( 'just now' );
	}

	if ( millisAgo < MILLIS_IN_MINUTE * 60 ) {
		let minutes = Math.ceil( millisAgo / ( MILLIS_IN_MINUTE ) );
		return i18n.translate( '%(minutes)dm ago', {
			args: {
				minutes: minutes
			},
			comment: 'example for a resulting string: 2m ago'
		} );
	}

	if ( millisAgo < MILLIS_IN_MINUTE * 60 * 24 ) {
		let hours = now.diff( dateOrMoment, 'hours' );
		return i18n.translate( '%(hours)dh ago', {
			args: {
				hours: hours
			},
			comment: 'example for a resulting string: 5h ago'
		} );
	}

	if ( millisAgo < MILLIS_IN_MINUTE * 60 * 24 * 7 ) {
		let days = now.diff( dateOrMoment, 'days' );
		return i18n.translate( '%(days)dd ago', {
			args: {
				days: days
			},
			comment: 'example for a resulting string: 4d ago'
		} );
	}

	return dateOrMoment.format( 'll' );
};
