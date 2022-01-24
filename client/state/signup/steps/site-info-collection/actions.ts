import {
	SIGNUP_STEPS_SITE_INFO_COLLECTION_UPDATE,
	SIGNUP_STEPS_SITE_INFO_UPDATE_CURRENT_SECTION,
} from 'calypso/state/action-types';
import { SiteInfo } from './schema';
import 'calypso/state/signup/init';

export function updateSiteInfoValues( data: SiteInfo ) {
	return {
		type: SIGNUP_STEPS_SITE_INFO_COLLECTION_UPDATE,
		payload: { ...data },
	};
}

export function updateSiteInfoCurrentSectionID( sectionID: string ) {
	return {
		type: SIGNUP_STEPS_SITE_INFO_UPDATE_CURRENT_SECTION,
		payload: sectionID,
	};
}
