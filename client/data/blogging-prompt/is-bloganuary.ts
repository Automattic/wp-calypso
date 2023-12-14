import { isEnabled } from '@automattic/calypso-config';
import moment from 'moment';
/**
 * @returns true if bloganuary mode is active
 */
export default function isBloganuary() {
	return moment( '2020-01-12' ).format( 'MM' ) === '01' || isEnabled( 'bloganuary' );
}
