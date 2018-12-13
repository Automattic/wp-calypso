/** @format */
/**
 * External Dependencies
 */
import { get } from 'lodash';
const BUSINESS_HOURS_PATH = [ 'businessHours' ];

export default function getBusinessHours() {
	return get( 'object' === typeof window ? window : null, BUSINESS_HOURS_PATH, null );
}
