import {
	getBackupField,
	getHostField,
	getLastPublishedField,
	getLikesField,
	getPhpVersionField,
	getPlanField,
	getPreviewField,
	getStorageField,
	getSubscribersField,
	getViewsField,
	getVisibilityField,
	getVisitorsField,
	getWpVersionField,
} from './details';
import { getSiteIconField, getSiteNameField, getSiteUrlField } from './site';
import type { AgencySite } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

export { getAgencyActions } from './actions';

export function getAgencyFields(
	viewType?: string,
	onSiteClick?: ( site: AgencySite ) => void
): Field< AgencySite >[] {
	return [
		getSiteNameField( onSiteClick ),
		getSiteUrlField(),
		getSiteIconField( viewType ),
		getSubscribersField(),
		getBackupField(),
		getPlanField(),
		getVisibilityField(),
		getWpVersionField(),
		getPreviewField(),
		getLastPublishedField(),
		getVisitorsField(),
		getViewsField(),
		getLikesField(),
		getPhpVersionField(),
		getStorageField(),
		getHostField(),
	];
}
