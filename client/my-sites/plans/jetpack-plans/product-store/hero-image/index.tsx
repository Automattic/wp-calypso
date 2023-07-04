import {
	PLAN_JETPACK_SECURITY_T1_YEARLY,
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_SECURITY_T1_MONTHLY,
	PLAN_JETPACK_COMPLETE_MONTHLY,
} from '@automattic/calypso-products';
import HeroComplete from 'calypso/assets/images/jetpack/hero-complete.png';
import HeroSecurity from 'calypso/assets/images/jetpack/hero-security.png';
import { HeroImageProps } from '../types';
import './style.scss';

const HERO_IMAGES: Record< string, string > = {
	[ PLAN_JETPACK_SECURITY_T1_YEARLY ]: HeroSecurity,
	[ PLAN_JETPACK_SECURITY_T1_MONTHLY ]: HeroSecurity,
	[ PLAN_JETPACK_COMPLETE ]: HeroComplete,
	[ PLAN_JETPACK_COMPLETE_MONTHLY ]: HeroComplete,
};

export const HeroImage: React.FC< HeroImageProps > = ( { item } ) => {
	const image = HERO_IMAGES[ item.productSlug ];

	if ( ! image ) {
		return null;
	}

	return (
		<div className="hero-image--container">
			<div
				className="hero-image--container-inner"
				style={ {
					backgroundImage: `url(${ image })`,
				} }
			/>
		</div>
	);
};
