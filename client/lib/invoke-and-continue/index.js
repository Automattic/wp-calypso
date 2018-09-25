/** @format */
/**
 * External dependencies
 */
import { isFunction } from 'lodash';

export default fn => data => ( isFunction( fn ) && fn() ) || data;
