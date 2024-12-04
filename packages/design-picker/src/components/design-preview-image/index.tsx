import { MShotsImage } from '@automattic/onboarding';
import { useViewportMatch } from '@wordpress/compose';
import photon from 'photon';
import { getDesignPreviewUrl, getMShotOptions } from '../../utils';
import type { Design, StyleVariation } from '../../types';
import type { FC } from 'react';

const makeOptionId = ( { slug }: Design ): string => `design-picker__option-name__${ slug }`;

interface DesignPreviewImageProps {
	design: Design;
	imageOptimizationExperiment?: boolean;
	locale?: string;
	styleVariation?: StyleVariation;
	oldHighResImageLoading?: boolean; // Temporary for A/B test.
}

const DesignPreviewImage: FC< DesignPreviewImageProps > = ( {
	design,
	locale,
	styleVariation,
	oldHighResImageLoading,
} ) => {
	const isMobile = useViewportMatch( 'small', '<' );

	if ( design?.design_tier === 'partner' && design.screenshot ) {
		const fit = '479,360';
		// We're stubbing out the high res version here as part of a size reduction experiment.
		// See #88786 and TODO for discussion / info.
		const themeImgSrc = photon( design.screenshot, { fit } ) || design.screenshot;
		const themeImgSrcDoubleDpi = photon( design.screenshot, { fit, zoom: 2 } ) || design.screenshot;

		if ( oldHighResImageLoading ) {
			return (
				<img
					src={ themeImgSrc }
					srcSet={ `${ themeImgSrcDoubleDpi } 2x` }
					alt={ design.description }
				/>
			);
		}

		return (
			<img
				loading="lazy"
				src={ themeImgSrc }
				srcSet={ `${ themeImgSrc }` }
				alt={ design.description }
			/>
		);
	}

	return (
		<MShotsImage
			url={ getDesignPreviewUrl( design, {
				use_screenshot_overrides: true,
				style_variation: styleVariation,
				...( locale && { language: locale } ),
			} ) }
			aria-labelledby={ makeOptionId( design ) }
			alt=""
			options={ getMShotOptions( {
				scrollable: false,
				highRes: ! isMobile,
				isMobile,
				oldHighResImageLoading,
			} ) }
			scrollable={ false }
		/>
	);
};

export default DesignPreviewImage;
