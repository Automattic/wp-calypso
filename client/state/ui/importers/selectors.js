/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

export const getImporterOption = state => get( state, 'ui.importers.importerOption' );
