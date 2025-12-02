import { nameField } from './name';
import { sitesCountField } from './sites-count';
import { updateAvailableField } from './update-available';
import type { PluginListRow } from '../types';
import type { Field } from '@wordpress/dataviews';

export const fields: Field< PluginListRow >[] = [
	nameField,
	sitesCountField,
	updateAvailableField,
];
