/**
 * External dependencies
 */
import * as React from 'react';
import { Button } from '@wordpress/components';
import classnames from 'classnames';
import isShallowEqual from '@wordpress/is-shallow-equal';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import { fontPairings, getFontTitle, FontPair } from '../../constants';
import { STORE_KEY } from '../../stores/onboard';
import designs from '../../available-designs';

const FontSelect: React.FunctionComponent = () => {
	const { __ } = useI18n();
	const { selectedDesign, selectedFonts } = useSelect( select => select( STORE_KEY ).getState() );
	const { setFonts } = useDispatch( STORE_KEY );

	// TODO: Add font loading for unknown fonts
	const selectedDesignDefaultFonts = designs.featured.find(
		design => design.slug === selectedDesign?.slug
	)?.fonts;

	const defaultFontOption = selectedDesignDefaultFonts ? (
		<>
			<span style={ { fontFamily: selectedDesignDefaultFonts.headings, fontWeight: 700 } }>
				{ getFontTitle( selectedDesignDefaultFonts.headings ) }
			</span>
			&nbsp;/&nbsp;
			<span style={ { fontFamily: selectedDesignDefaultFonts.base } }>
				{ getFontTitle( selectedDesignDefaultFonts.base ) }
			</span>
		</>
	) : (
		__( 'Default fonts' )
	);

	const fontPairingsFilter = ( pair: FontPair ): boolean => {
		if ( ! selectedDesignDefaultFonts ) {
			return true;
		}
		return ! isShallowEqual( pair, selectedDesignDefaultFonts );
	};

	return (
		<div className="style-preview__font-options">
			<Button
				className={ classnames( 'style-preview__font-option', {
					'is-selected':
						selectedFonts?.headings === selectedDesignDefaultFonts?.headings &&
						selectedFonts?.base === selectedDesignDefaultFonts?.base,
				} ) }
				onClick={ () => setFonts( selectedDesignDefaultFonts ) }
			>
				<span className="style-preview__font-option-contents">{ defaultFontOption }</span>
			</Button>
			{ fontPairings.filter( fontPairingsFilter ).map( fontPair => {
				// Font pairs are objects, we need `isShallowEqual` as we can't guarantee referential equality
				// (E.g. if `selectedFonts` is coming from persisted state)
				const isSelected = !! selectedFonts && isShallowEqual( fontPair, selectedFonts );
				const { headings, base } = fontPair;

				return (
					<Button
						className={ classnames( 'style-preview__font-option', { 'is-selected': isSelected } ) }
						onClick={ () => setFonts( fontPair ) }
						key={ headings + base }
					>
						<span className="style-preview__font-option-contents">
							<span style={ { fontFamily: headings, fontWeight: 700 } }>
								{ getFontTitle( headings ) }
							</span>
							&nbsp;/&nbsp;
							<span style={ { fontFamily: base } }>{ getFontTitle( base ) }</span>
						</span>
					</Button>
				);
			} ) }
		</div>
	);
};

export default FontSelect;
