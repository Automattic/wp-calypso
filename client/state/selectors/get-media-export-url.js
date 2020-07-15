/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'state/exporter/init';

export default ( state ) => get( state, 'exporter.mediaExportUrl', null );
