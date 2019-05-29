/* global fullSiteEditing */
/**
 * External dependencies
 */
import { get } from 'lodash';

const isEnabled = flag => get( fullSiteEditing, [ 'featureFlags', flag ], false );

export default isEnabled;
