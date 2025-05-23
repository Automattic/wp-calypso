import { Site } from '../../data/types';

export function canUpdateWordPressVersion( site: Site ) {
	return site.is_wpcom_staging_site;
}
