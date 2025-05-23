import { Site } from '../../data/types';

export function canUpdatePHPVersion( site: Site ) {
	return site.is_wpcom_atomic;
}
