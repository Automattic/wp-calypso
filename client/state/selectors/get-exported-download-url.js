/**
 * External dependencies
 */
import { get } from 'lodash';

export default state => get( state, 'siteSettings.exporter.downloadURL', null );
