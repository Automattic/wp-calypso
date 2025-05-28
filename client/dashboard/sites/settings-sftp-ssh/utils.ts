import { DotcomFeatures } from '../../data/constants';
import { Site } from '../../data/types';

export function hasSftpFeature( site: Site ) {
	if ( ! site.plan ) {
		return false;
	}
	return site.plan.features.active.includes( DotcomFeatures.SFTP );
}

export function hasSshFeature( site: Site ) {
	if ( ! site.plan ) {
		return false;
	}
	return site.plan.features.active.includes( DotcomFeatures.SSH );
}

export function canUseSftp( site: Site ) {
	return !! site.is_wpcom_atomic && ! site.plan?.expired && hasSftpFeature( site );
}

export function canUseSsh( site: Site ) {
	return canUseSftp( site ) && hasSshFeature( site );
}
