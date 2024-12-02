import {
	PLAN_JETPACK_COMPLETE_MONTHLY,
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_COMPLETE_BI_YEARLY,
	PLAN_JETPACK_SECURITY_T1_MONTHLY,
	PLAN_JETPACK_SECURITY_T1_YEARLY,
	PLAN_JETPACK_SECURITY_T1_BI_YEARLY,
	PLAN_JETPACK_GROWTH_MONTHLY,
	PLAN_JETPACK_GROWTH_YEARLY,
	PLAN_JETPACK_GROWTH_BI_YEARLY,
} from '@automattic/calypso-products';
import CompleteHorizontalMd from 'calypso/assets/images/jetpack/hero-complete-horizontal-md.jpg';
import GrowthHorizontalMd from 'calypso/assets/images/jetpack/hero-growth-horizontal-md.jpg';
import SecurityHorizontalMd from 'calypso/assets/images/jetpack/hero-security-horizontal-md.jpg';
import { HeroImageProps, HeroImageAPIFamilyProps } from '../types';
import './style.scss';

const HERO_IMAGES: Record< string, { lg: string; md: string; sm: string } > = {
	[ PLAN_JETPACK_SECURITY_T1_BI_YEARLY ]: {
		lg: SecurityHorizontalMd,
		md: SecurityHorizontalMd,
		sm: SecurityHorizontalMd,
	},
	[ PLAN_JETPACK_SECURITY_T1_YEARLY ]: {
		lg: SecurityHorizontalMd,
		md: SecurityHorizontalMd,
		sm: SecurityHorizontalMd,
	},
	[ PLAN_JETPACK_SECURITY_T1_MONTHLY ]: {
		lg: SecurityHorizontalMd,
		md: SecurityHorizontalMd,
		sm: SecurityHorizontalMd,
	},
	[ PLAN_JETPACK_COMPLETE_BI_YEARLY ]: {
		lg: CompleteHorizontalMd,
		md: CompleteHorizontalMd,
		sm: CompleteHorizontalMd,
	},
	[ PLAN_JETPACK_COMPLETE ]: {
		lg: CompleteHorizontalMd,
		md: CompleteHorizontalMd,
		sm: CompleteHorizontalMd,
	},
	[ PLAN_JETPACK_COMPLETE_MONTHLY ]: {
		lg: CompleteHorizontalMd,
		md: CompleteHorizontalMd,
		sm: CompleteHorizontalMd,
	},
	[ PLAN_JETPACK_GROWTH_MONTHLY ]: {
		lg: GrowthHorizontalMd,
		md: GrowthHorizontalMd,
		sm: GrowthHorizontalMd,
	},
	[ PLAN_JETPACK_GROWTH_YEARLY ]: {
		lg: GrowthHorizontalMd,
		md: GrowthHorizontalMd,
		sm: GrowthHorizontalMd,
	},
	[ PLAN_JETPACK_GROWTH_BI_YEARLY ]: {
		lg: GrowthHorizontalMd,
		md: GrowthHorizontalMd,
		sm: GrowthHorizontalMd,
	},
};

const HERO_IMAGES_API_FAMILY: Record< string, { lg: string; md: string; sm: string } > = {
	[ 'jetpack-security-t1' ]: {
		lg: SecurityHorizontalMd,
		md: SecurityHorizontalMd,
		sm: SecurityHorizontalMd,
	},
	[ 'jetpack-security-t2' ]: {
		lg: SecurityHorizontalMd,
		md: SecurityHorizontalMd,
		sm: SecurityHorizontalMd,
	},
	[ 'jetpack-complete' ]: {
		lg: CompleteHorizontalMd,
		md: CompleteHorizontalMd,
		sm: CompleteHorizontalMd,
	},
	[ 'jetpack-growth' ]: {
		lg: GrowthHorizontalMd,
		md: GrowthHorizontalMd,
		sm: GrowthHorizontalMd,
	},
};

const generateHeroImage = (
	smallScreenImage: string,
	mediumScreenImage: string,
	largeScreenImage: string
) => {
	return (
		<div className="hero-image--container">
			<div
				className="hero-image--container-inner-small-screen"
				style={ {
					backgroundImage: `url(${ smallScreenImage })`,
				} }
			/>
			<div
				className="hero-image--container-inner-medium-screen"
				style={ {
					backgroundImage: `url(${ mediumScreenImage })`,
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

export const HeroImageAPIFamily: React.FC< HeroImageAPIFamilyProps > = ( { item } ) => {
	const smallScreenImage = HERO_IMAGES_API_FAMILY[ item.slug ]?.sm;
	const largeScreenImage = HERO_IMAGES_API_FAMILY[ item.slug ]?.lg;

	//mediumScreenImage is just only for Jetpack Complete, for other products it is same as largeScreenImage
	const mediumScreenImage = HERO_IMAGES_API_FAMILY[ item.slug ]?.md ?? largeScreenImage;

	if ( ! smallScreenImage || ! mediumScreenImage || ! largeScreenImage ) {
		return null;
	}

	return generateHeroImage( smallScreenImage, mediumScreenImage, largeScreenImage );
};

export const HeroImage: React.FC< HeroImageProps > = ( { item } ) => {
	const smallScreenImage = HERO_IMAGES[ item.productSlug ]?.sm;
	const largeScreenImage = HERO_IMAGES[ item.productSlug ]?.lg;

	//mediumScreenImage is just only for Jetpack Complete, for other products it is same as largeScreenImage
	const mediumScreenImage = HERO_IMAGES[ item.productSlug ]?.md ?? largeScreenImage;

	if ( ! smallScreenImage || ! mediumScreenImage || ! largeScreenImage ) {
		return null;
	}
	return generateHeroImage( smallScreenImage, mediumScreenImage, largeScreenImage );
};
