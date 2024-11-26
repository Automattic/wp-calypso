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
import CompleteHorizontalLg from 'calypso/assets/images/jetpack/hero-complete-horizontal-lg.jpg';
import GrowthHorizontalLg from 'calypso/assets/images/jetpack/hero-growth-horizontal-lg.jpg';
import SecurityHorizontalLg from 'calypso/assets/images/jetpack/hero-security-horizontal-lg.jpg';
import { HeroImageProps, HeroImageAPIFamilyProps } from '../types';
import './style.scss';

const HERO_IMAGES: Record< string, { lg: string; md: string; sm: string } > = {
	[ PLAN_JETPACK_SECURITY_T1_BI_YEARLY ]: {
		lg: SecurityHorizontalLg,
		md: SecurityHorizontalLg,
		sm: SecurityHorizontalLg,
	},
	[ PLAN_JETPACK_SECURITY_T1_YEARLY ]: {
		lg: SecurityHorizontalLg,
		md: SecurityHorizontalLg,
		sm: SecurityHorizontalLg,
	},
	[ PLAN_JETPACK_SECURITY_T1_MONTHLY ]: {
		lg: SecurityHorizontalLg,
		md: SecurityHorizontalLg,
		sm: SecurityHorizontalLg,
	},
	[ PLAN_JETPACK_COMPLETE_BI_YEARLY ]: {
		lg: CompleteHorizontalLg,
		md: CompleteHorizontalLg,
		sm: CompleteHorizontalLg,
	},
	[ PLAN_JETPACK_COMPLETE ]: {
		lg: CompleteHorizontalLg,
		md: CompleteHorizontalLg,
		sm: CompleteHorizontalLg,
	},
	[ PLAN_JETPACK_COMPLETE_MONTHLY ]: {
		lg: CompleteHorizontalLg,
		md: CompleteHorizontalLg,
		sm: CompleteHorizontalLg,
	},
	[ PLAN_JETPACK_GROWTH_MONTHLY ]: {
		lg: GrowthHorizontalLg,
		md: GrowthHorizontalLg,
		sm: GrowthHorizontalLg,
	},
	[ PLAN_JETPACK_GROWTH_YEARLY ]: {
		lg: GrowthHorizontalLg,
		md: GrowthHorizontalLg,
		sm: GrowthHorizontalLg,
	},
	[ PLAN_JETPACK_GROWTH_BI_YEARLY ]: {
		lg: GrowthHorizontalLg,
		md: GrowthHorizontalLg,
		sm: GrowthHorizontalLg,
	},
};

const HERO_IMAGES_API_FAMILY: Record< string, { lg: string; md: string; sm: string } > = {
	[ 'jetpack-security-t1' ]: {
		lg: SecurityHorizontalLg,
		md: SecurityHorizontalLg,
		sm: SecurityHorizontalLg,
	},
	[ 'jetpack-security-t2' ]: {
		lg: SecurityHorizontalLg,
		md: SecurityHorizontalLg,
		sm: SecurityHorizontalLg,
	},
	[ 'jetpack-complete' ]: {
		lg: CompleteHorizontalLg,
		md: CompleteHorizontalLg,
		sm: CompleteHorizontalLg,
	},
	[ 'jetpack-growth' ]: {
		lg: GrowthHorizontalLg,
		md: GrowthHorizontalLg,
		sm: GrowthHorizontalLg,
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
