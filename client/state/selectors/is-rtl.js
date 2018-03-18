/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns whether the current uses right-to-left directionality.
 *
 * @param  {Object}   state      Global state tree
 * @return {Boolean}             Current user is rtl
 */
export default state => get( state, 'ui.language.isRtl', null );
