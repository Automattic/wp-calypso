import {
	SIGNUP_STEPS_SITE_INFO_COLLECTION_UPDATE,
	SIGNUP_STEPS_SITE_INFO_UPDATE_CURRENT_INDEX,
} from 'calypso/state/action-types';
import { SiteInfoCollectionData } from './schema';
import 'calypso/state/signup/init';

export function updateSiteInfoValues( data: SiteInfoCollectionData ) {
	return {
		type: SIGNUP_STEPS_SITE_INFO_COLLECTION_UPDATE,
		data: { ...data },
	};
}

export function updateSiteInfoCurrentIndex( currentIndex: number ) {
	return {
		type: SIGNUP_STEPS_SITE_INFO_UPDATE_CURRENT_INDEX,
		currentIndex,
	};
}
