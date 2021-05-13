/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/exporter/init';

export default ( state ) => get( state, 'exporter.mediaExportUrl', null );
