/**
 * External dependencies
 */
import i18n from 'i18n-calypso';

export default {
	isValidGMTOffset( gmtOffset ) {
		return 'number' === typeof gmtOffset;
	},

	/**
	 * Return localized date depending of given timezone and gmtOffset
	 * parameters.
	 *
	 * @param {Moment} date - date instance
	 * @param {String} tz - timezone
	 * @param {Number} gmt - gmt offset
	 * @return {Moment} localized date
	 */
	getLocalizedDate( date, tz, gmt ) {
		date = i18n.moment( date );

		if ( tz ) {
			date.tz( tz );
		} else if ( this.isValidGMTOffset( gmt ) ) {
			date.utcOffset( gmt );
		}

		return date;
	},

	convertDateToUserLocation( date, tz, gmt ) {
		if ( ! ( tz || this.isValidGMTOffset( gmt ) ) ) {
			return i18n.moment( date );
		}

		return this.getDateInLocalUTC( date )
			.subtract( this.getTimeOffset( date, tz, gmt ), 'minute' );
	},

	convertDateToGivenOffset( date, tz, gmt ) {
		date = this.getLocalizedDate( date, tz, gmt )
			.add( this.getTimeOffset( date, tz, gmt ), 'minute' );

		if ( ! tz && this.isValidGMTOffset( gmt ) ) {
			date.utcOffset( gmt );
		};

		return date;
	},

	getTimeOffset( date, tz, gmt ) {
		const userLocalDate = this.getDateInLocalUTC( date ),
			localizedDate = this.getLocalizedDate( date, tz, gmt );

		return userLocalDate.utcOffset() - localizedDate.utcOffset();
	},

	getDateInLocalUTC( date ) {
		return i18n.moment( date.format ? date.format() : date )
	}
}
