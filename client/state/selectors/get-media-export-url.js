/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

export default state => get( state, 'siteSettings.exporter.mediaExportUrl', null );
