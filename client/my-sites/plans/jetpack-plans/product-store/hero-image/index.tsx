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
import CompleteHorizontalMd2x from 'calypso/assets/images/jetpack/hero-complete-horizontal-md@2x.jpg';
import GrowthHorizontalMd from 'calypso/assets/images/jetpack/hero-growth-horizontal-md.jpg';
import GrowthHorizontalMd2x from 'calypso/assets/images/jetpack/hero-growth-horizontal-md@2x.jpg';
import SecurityHorizontalMd from 'calypso/assets/images/jetpack/hero-security-horizontal-md.jpg';
import SecurityHorizontalMd2x from 'calypso/assets/images/jetpack/hero-security-horizontal-md@2x.jpg';
import { HeroImageProps, HeroImageAPIFamilyProps } from '../types';
import './style.scss';

type HeroImagePathProps = {
	lg: string;
	lg2x: string;
	md: string;
	md2x: string;
	sm: string;
	sm2x: string;
};

const HERO_IMAGES_SECURITY: HeroImagePathProps = {
	lg: SecurityHorizontalMd,
	lg2x: SecurityHorizontalMd2x,
	md: SecurityHorizontalMd,
	md2x: SecurityHorizontalMd2x,
	sm: SecurityHorizontalMd,
	sm2x: SecurityHorizontalMd2x,
};

const HERO_IMAGES_COMPLETE: HeroImagePathProps = {
	lg: CompleteHorizontalMd,
	lg2x: CompleteHorizontalMd2x,
	md: CompleteHorizontalMd,
	md2x: CompleteHorizontalMd2x,
	sm: CompleteHorizontalMd,
	sm2x: CompleteHorizontalMd2x,
};

const HERO_IMAGES_GROWTH: HeroImagePathProps = {
	lg: GrowthHorizontalMd,
	lg2x: GrowthHorizontalMd2x,
	md: GrowthHorizontalMd,
	md2x: GrowthHorizontalMd2x,
	sm: GrowthHorizontalMd,
	sm2x: GrowthHorizontalMd2x,
};

const HERO_IMAGES: Record< string, HeroImagePathProps > = {
	[ PLAN_JETPACK_SECURITY_T1_BI_YEARLY ]: HERO_IMAGES_SECURITY,
	[ PLAN_JETPACK_SECURITY_T1_YEARLY ]: HERO_IMAGES_SECURITY,
	[ PLAN_JETPACK_SECURITY_T1_MONTHLY ]: HERO_IMAGES_SECURITY,
	[ PLAN_JETPACK_COMPLETE_BI_YEARLY ]: HERO_IMAGES_COMPLETE,
	[ PLAN_JETPACK_COMPLETE ]: HERO_IMAGES_COMPLETE,
	[ PLAN_JETPACK_COMPLETE_MONTHLY ]: HERO_IMAGES_COMPLETE,
	[ PLAN_JETPACK_GROWTH_MONTHLY ]: HERO_IMAGES_GROWTH,
	[ PLAN_JETPACK_GROWTH_YEARLY ]: HERO_IMAGES_GROWTH,
	[ PLAN_JETPACK_GROWTH_BI_YEARLY ]: HERO_IMAGES_GROWTH,
};

const HERO_IMAGES_API_FAMILY: Record< string, HeroImagePathProps > = {
	[ 'jetpack-security-t1' ]: HERO_IMAGES_SECURITY,
	[ 'jetpack-security-t2' ]: HERO_IMAGES_SECURITY,
	[ 'jetpack-complete' ]: HERO_IMAGES_COMPLETE,
	[ 'jetpack-growth' ]: HERO_IMAGES_GROWTH,
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
	const isDense = window?.devicePixelRatio > 1;
	const smallScreenImage =
		isDense && HERO_IMAGES_API_FAMILY[ item.slug ]?.sm2x
			? HERO_IMAGES_API_FAMILY[ item.slug ]?.sm2x
			: HERO_IMAGES_API_FAMILY[ item.slug ]?.sm;
	const largeScreenImage =
		isDense && HERO_IMAGES_API_FAMILY[ item.slug ]?.lg2x
			? HERO_IMAGES_API_FAMILY[ item.slug ]?.lg2x
			: HERO_IMAGES_API_FAMILY[ item.slug ]?.lg;

	//mediumScreenImage is just only for Jetpack Complete, for other products it is same as largeScreenImage
	const mediumScreenImage =
		isDense && HERO_IMAGES_API_FAMILY[ item.slug ]?.md2x
			? HERO_IMAGES_API_FAMILY[ item.slug ]?.md2x
			: HERO_IMAGES_API_FAMILY[ item.slug ]?.md ?? largeScreenImage;

	if ( ! smallScreenImage || ! mediumScreenImage || ! largeScreenImage ) {
		return null;
	}

	return generateHeroImage( smallScreenImage, mediumScreenImage, largeScreenImage );
};

export const HeroImage: React.FC< HeroImageProps > = ( { item } ) => {
	const isDense = window?.devicePixelRatio > 1;
	const smallScreenImage =
		isDense && HERO_IMAGES[ item.productSlug ]?.sm2x
			? HERO_IMAGES[ item.productSlug ]?.sm2x
			: HERO_IMAGES[ item.productSlug ]?.sm;
	const largeScreenImage =
		isDense && HERO_IMAGES[ item.productSlug ]?.lg2x
			? HERO_IMAGES[ item.productSlug ]?.lg2x
			: HERO_IMAGES[ item.productSlug ]?.lg;

	//mediumScreenImage is just only for Jetpack Complete, for other products it is same as largeScreenImage
	const mediumScreenImage =
		isDense && HERO_IMAGES[ item.productSlug ]?.md2x
			? HERO_IMAGES[ item.productSlug ]?.md2x
			: HERO_IMAGES[ item.productSlug ]?.md ?? largeScreenImage;

	if ( ! smallScreenImage || ! mediumScreenImage || ! largeScreenImage ) {
		return null;
	}
	return generateHeroImage( smallScreenImage, mediumScreenImage, largeScreenImage );
};
