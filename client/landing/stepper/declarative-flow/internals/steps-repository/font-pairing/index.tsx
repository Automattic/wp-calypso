/* eslint-disable wpcalypso/jsx-classname-namespace */
import { FontPair, getFontTitle } from '@automattic/design-picker';
import { StepContainer } from '@automattic/onboarding';
import React from 'react';
import { useFontPairings } from 'calypso/landing/gutenboarding/fonts';
import StylePreview from 'calypso/landing/gutenboarding/onboarding-block/style-preview';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';
import './style.scss';

const FontPairingStep: Step = function FontPairingStep( { navigation } ) {
	const { goBack, submit } = navigation;

	const effectiveFontPairings = useFontPairings();
	// TODO: Explore alternatives for loading fonts and optimizations
	// TODO: Don't load like this
	React.useEffect( () => {
		effectiveFontPairings.forEach( ( { base, headings }: FontPair ) => {
			const linkBase = document.createElement( 'link' );
			const linkHeadings = document.createElement( 'link' );

			linkBase.href = `https://fonts.googleapis.com/css2?family=${ encodeURI(
				base
			) }&text=${ encodeURI( getFontTitle( base ) ) }&display=swap`;
			linkHeadings.href = `https://fonts.googleapis.com/css2?family=${ encodeURI(
				headings
			) }:wght@700&text=${ encodeURI( getFontTitle( headings ) ) }&display=swap`;

			linkBase.rel = 'stylesheet';
			linkHeadings.rel = 'stylesheet';

			linkBase.type = 'text/css';
			linkHeadings.type = 'text/css';

			document.head.appendChild( linkBase );
			document.head.appendChild( linkHeadings );
		} );
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<StepContainer
			stepName={ 'font-pairing-step' }
			goBack={ goBack }
			hideSkip
			isFullLayout
			stepContent={ <StylePreview submit={ submit } /> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default FontPairingStep;
