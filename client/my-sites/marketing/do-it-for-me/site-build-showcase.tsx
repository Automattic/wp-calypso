import { useLocale } from '@automattic/i18n-utils';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import enSite1 from 'calypso/assets/images/difm/site-builds-en/en-1.jpg';
import enSite2 from 'calypso/assets/images/difm/site-builds-en/en-2.jpg';
import enSite3 from 'calypso/assets/images/difm/site-builds-en/en-3.jpg';
import enSite4 from 'calypso/assets/images/difm/site-builds-en/en-4.jpg';
import enSite5 from 'calypso/assets/images/difm/site-builds-en/en-5.jpg';
import enSite6 from 'calypso/assets/images/difm/site-builds-en/en-6.jpg';
import esSite1 from 'calypso/assets/images/difm/site-builds-es/es-1.jpg';
import esSite2 from 'calypso/assets/images/difm/site-builds-es/es-2.jpg';
import esSite3 from 'calypso/assets/images/difm/site-builds-es/es-3.jpg';
import esSite4 from 'calypso/assets/images/difm/site-builds-es/es-4.jpg';
import esSite5 from 'calypso/assets/images/difm/site-builds-es/es-5.jpg';
import esSite6 from 'calypso/assets/images/difm/site-builds-es/es-6.jpg';
import type { CSSPropertiesWithMultiValues } from '@emotion/serialize';

/**
 * Generate keyframes for the fade animation. There are two
 * transitions:
 * 1. Opacity 0 -> 1, from 0 seconds to `fadeDelay` seconds. (Fade In)
 * 2. Opacity 1 -> 0, from `interval` seconds to `interval + fadeDelay` seconds (Fade Out)
 *
 * Since the keyframes need to be expressed in terms of a percentage,
 * this function calculates the percentage in terms of the total animation time.
 * @param slideCount Total number of slides in the slideshow
 * @param interval Time interval for displaying each slide, in seconds.
 * @param fadeDelay Time taken for the fade animation, in seconds.
 * @returns keyframes
 */
function fadeAnimation( slideCount: number, interval: number, fadeDelay: number ) {
	const totalAnimationTime = slideCount * interval;

	return keyframes`
	${ ( fadeDelay / totalAnimationTime ) * 100 + '%' } {
		opacity: 1;
	}

	${ ( interval / totalAnimationTime ) * 100 + '%' } {
		opacity: 1;
	}

	${ ( ( interval + fadeDelay ) / totalAnimationTime ) * 100 + '%' } {
		opacity: 0;
	}
`;
}

/**
 * Generate animation delays for staggered animation. Otherwise, all
 * slides will animate at the same time. The delay is added to all
 * elements except the first one.
 *
 * For example, if the interval is 5 seconds, the second slide will start
 * fading in after 5 seconds, the third after 10 seconds and so on.
 * @param slideCount Total number of slides in the slideshow
 * @param interval Time interval for displaying each slide, in seconds.
 */
function nthOfTypeAnimationDelay( slideCount: number, interval: number ) {
	const styles: Record< string, CSSPropertiesWithMultiValues > = {};
	for ( let i = 2; i <= slideCount; i++ ) {
		styles[ `> div:nth-of-type( ${ i } )` ] = {
			animationDelay: `${ ( i - 1 ) * interval }s`,
		};
	}
	return styles;
}

type AnimatedSlideShowProps = {
	slideCount: number;
	interval: number;
	fadeDelay: number;
};

/**
 * This container element renders an animated slideshow with a fade animation.
 * The child elements should be div elements.
 * @param props
 * @param props.slideCount Total number of slides in the slideshow
 * @param props.interval Time interval for displaying each slide, in seconds.
 * @param props.fadeDelay Time taken for the fade animation, in seconds.
 */
const AnimatedSlideshow = styled.div< AnimatedSlideShowProps >`
	height: 100%;
	width: 100%;
	position: relative;

	> div {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		animation: ${ ( props ) => fadeAnimation( props.slideCount, props.interval, props.fadeDelay ) }
			${ ( props ) => props.slideCount * props.interval }s infinite;
		background-size: contain;
		background-repeat: no-repeat;
		opacity: 0;
	}

	${ ( props ) => nthOfTypeAnimationDelay( props.slideCount, props.interval ) }
`;

const getLocalizedImages = ( locale: string ) => {
	switch ( locale ) {
		case 'es':
			return [ esSite1, esSite2, esSite3, esSite4, esSite5, esSite6 ];
		default:
			return [ enSite1, enSite2, enSite3, enSite4, enSite5, enSite6 ];
	}
};

export default function SiteBuildShowcase() {
	const locale = useLocale();
	const images = getLocalizedImages( locale );
	return (
		<AnimatedSlideshow slideCount={ images.length } interval={ 8 } fadeDelay={ 2.5 }>
			{ images.map( ( image, index ) => (
				<div key={ index } style={ { backgroundImage: `url( ${ image } )` } } />
			) ) }
		</AnimatedSlideshow>
	);
}
