import { getBackupField } from './backup';
import { getBoostField } from './boost';
import { getSiteIconField, getSiteNameField, getSiteUrlField } from './site';
import type { AgencySite } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

export { getAgencyActions } from './actions';

export function getAgencyFields(
	viewType?: string,
	onSiteClick?: ( site: AgencySite ) => void
): Field< AgencySite >[] {
	return [
		getSiteIconField( viewType ),
		getSiteNameField( onSiteClick ),
		getSiteUrlField(),
		getBoostField(),
		getBackupField(),
	];
}
