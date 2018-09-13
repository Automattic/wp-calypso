/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

export default state => get( state, 'i18n.languageRevisions.items', {} );
