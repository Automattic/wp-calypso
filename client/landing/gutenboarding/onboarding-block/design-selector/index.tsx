/**
 * External dependencies
 */
import React from 'react';
import { useDispatch } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { useI18n } from '@automattic/react-i18n';
import { useHistory } from 'react-router-dom';

/**
 * Internal dependencies
 */
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import designs from '../../available-designs';
import { usePath, Step } from '../../path';
import { isEnabled } from '../../../../config';
import Link from '../../components/link';
import { SubTitle, Title } from '../../components/titles';

import './style.scss';

type Design = import('../../stores/onboard/types').Design;

const makeOptionId = ( { slug }: Design ): string => `design-selector__option-name__${ slug }`;

const DesignSelector: React.FunctionComponent = () => {
	const { __ } = useI18n();
	const { push } = useHistory();
	const makePath = usePath();
	const { setSelectedDesign, setFonts, resetOnboardStore } = useDispatch( ONBOARD_STORE );

	const getDesignUrl = ( design: Design ) => {
		// We temporarily show pre-generated screenshots until we can generate tall versions dynamically using mshots.
		// See `bin/generate-gutenboarding-design-thumbnails.js` for generating screenshots.
		// https://github.com/Automattic/mShots/issues/16
		// https://github.com/Automattic/wp-calypso/issues/40564
		if ( ! isEnabled( 'gutenboarding/mshot-preview' ) ) {
			return `/calypso/page-templates/design-screenshots/${ design.slug }_${ design.template }_${ design.theme }.jpg`;
		}

		const mshotsUrl = 'https://s.wordpress.com/mshots/v1/';
		const previewUrl = addQueryArgs( design.src, {
			font_headings: design.fonts.headings,
			font_base: design.fonts.base,
		} );
		return mshotsUrl + encodeURIComponent( previewUrl );
	};

	return (
		<div className="gutenboarding-page design-selector">
			<div className="design-selector__header">
				<div className="design-selector__heading">
					<Title>{ __( 'Choose a starting design' ) }</Title>
					<SubTitle>
						{ __(
							'Get started with one of our top website layouts. You can always change it later'
						) }
					</SubTitle>
				</div>
				<Link
					className="design-selector__start-over-button"
					onClick={ () => resetOnboardStore() }
					to={ makePath( Step.IntentGathering ) }
					isLink
				>
					{ __( 'Go back' ) }
				</Link>
			</div>
			<div className="design-selector__design-grid">
				<div className="design-selector__grid">
					{ designs.featured.map( design => (
						<button
							key={ design.slug }
							className="design-selector__design-option"
							onClick={ () => {
								setSelectedDesign( design );

								// Update fonts to the design defaults
								setFonts( design.fonts );

								if ( isEnabled( 'gutenboarding/style-preview' ) ) {
									push( makePath( Step.Style ) );
								}
							} }
						>
							<span className="design-selector__image-frame">
								<img
									alt=""
									aria-labelledby={ makeOptionId( design ) }
									src={ getDesignUrl( design ) }
								/>
							</span>
							<span className="design-selector__option-overlay">
								<span id={ makeOptionId( design ) } className="design-selector__option-name">
									{ design.title }
								</span>
							</span>
						</button>
					) ) }
				</div>
			</div>
		</div>
	);
};

export default DesignSelector;
