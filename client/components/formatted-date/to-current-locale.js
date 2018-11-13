/**
 * External dependencies
 */
import moment from 'moment';

export default function toCurrentLocale( m ) {
	if ( m.locale() === moment.locale() ) {
		return m;
	}
	return m.clone().locale( moment.locale() );
}
