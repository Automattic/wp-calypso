import {
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PRODUCT_JETPACK_VIDEOPRESS,
	PLAN_JETPACK_SECURITY_T1_YEARLY,
	PLAN_JETPACK_COMPLETE,
	PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
	PLAN_JETPACK_SECURITY_T1_MONTHLY,
	PRODUCT_JETPACK_VIDEOPRESS_MONTHLY,
	PLAN_JETPACK_COMPLETE_MONTHLY,
} from '@automattic/calypso-products';
import BackupLg from 'calypso/assets/images/jetpack/hero-backup-lg.png';
import BackupSm from 'calypso/assets/images/jetpack/hero-backup-sm.png';
import CompleteLg from 'calypso/assets/images/jetpack/hero-complete-lg.png';
import CompleteSm from 'calypso/assets/images/jetpack/hero-complete-sm.png';
import SecurityLg from 'calypso/assets/images/jetpack/hero-security-lg.png';
import SecuritySm from 'calypso/assets/images/jetpack/hero-security-sm.png';
import VideoPressLg from 'calypso/assets/images/jetpack/hero-videopress-lg.png';
import VideoPressSm from 'calypso/assets/images/jetpack/hero-videopress-sm.png';
import { HeroImageProps } from '../types';
import './style.scss';

const HERO_IMAGES: Record< string, { lg: string; sm: string } > = {
	[ PRODUCT_JETPACK_BACKUP_T1_YEARLY ]: {
		lg: BackupLg,
		sm: BackupSm,
	},
	[ PRODUCT_JETPACK_BACKUP_T1_MONTHLY ]: {
		lg: BackupLg,
		sm: BackupSm,
	},
	[ PRODUCT_JETPACK_VIDEOPRESS ]: {
		lg: VideoPressLg,
		sm: VideoPressSm,
	},
	[ PRODUCT_JETPACK_VIDEOPRESS_MONTHLY ]: {
		lg: VideoPressLg,
		sm: VideoPressSm,
	},
	[ PLAN_JETPACK_SECURITY_T1_YEARLY ]: {
		lg: SecurityLg,
		sm: SecuritySm,
	},
	[ PLAN_JETPACK_SECURITY_T1_MONTHLY ]: {
		lg: SecurityLg,
		sm: SecuritySm,
	},
	[ PLAN_JETPACK_COMPLETE ]: {
		lg: CompleteLg,
		sm: CompleteSm,
	},
	[ PLAN_JETPACK_COMPLETE_MONTHLY ]: {
		lg: CompleteLg,
		sm: CompleteSm,
	},
};

export const HeroImage: React.FC< HeroImageProps > = ( { item } ) => {
	const smallScreenImage = HERO_IMAGES[ item.productSlug ]?.sm;
	const largeScreenImage = HERO_IMAGES[ item.productSlug ]?.lg;

	if ( ! smallScreenImage || ! largeScreenImage ) {
		return null;
	}

	return (
		<div className="hero-image--container">
			<div
				className="hero-image--container-inner-small-screen"
				style={ {
					backgroundImage: `url(${ smallScreenImage })`,
				} }
			/>
			<div
				className="hero-image--container-inner-large-screen"
				style={ {
					backgroundImage: `url(${ largeScreenImage })`,
				} }
			/>
		</div>
	);
};
