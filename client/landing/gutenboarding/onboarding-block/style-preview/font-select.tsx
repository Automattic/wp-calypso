/**
 * External dependencies
 */
import * as React from 'react';
import { Button } from '@wordpress/components';
import { Icon, chevronDown } from '@wordpress/icons';
import classnames from 'classnames';
import isShallowEqual from '@wordpress/is-shallow-equal';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import { fontPairings, getFontTitle, FontPair } from '../../constants';
import { STORE_KEY } from '../../stores/onboard';
import type { Design } from '../../stores/onboard/types';

const FontSelect: React.FunctionComponent = () => {
	const { __ } = useI18n();
	const { selectedDesign, selectedFonts } = useSelect( ( select ) =>
		select( STORE_KEY ).getState()
	);
	const { getRandomizedDesigns } = useSelect( ( select ) => select( STORE_KEY ) );
	const { setFonts } = useDispatch( STORE_KEY );
	const [ isOpen, setIsOpen ] = React.useState( false );

	// TODO: Add font loading for unknown fonts
	const selectedDesignDefaultFonts = getRandomizedDesigns().featured.find(
		( design: Design ) => design.slug === selectedDesign?.slug
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

	const selectedFontOption = selectedFonts ? (
		<>
			<span style={ { fontFamily: selectedFonts.headings, fontWeight: 700 } }>
				{ getFontTitle( selectedFonts.headings ) }
			</span>
			&nbsp;/&nbsp;
			<span style={ { fontFamily: selectedFonts.base } }>
				{ getFontTitle( selectedFonts.base ) }
			</span>
		</>
	) : (
		__( 'Select fonts' )
	);

	const fontPairingsFilter = ( pair: FontPair ): boolean => {
		if ( ! selectedDesignDefaultFonts ) {
			return true;
		}
		return ! isShallowEqual( pair, selectedDesignDefaultFonts );
	};

	const setFontsAndClose = ( pair?: FontPair ) => {
		setFonts( pair );
		setIsOpen( false );
	};

	return (
		<>
			<div className="style-preview__font-options">
				<div className="style-preview__font-options-desktop">
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
					{ fontPairings.filter( fontPairingsFilter ).map( ( fontPair ) => {
						// Font pairs are objects, we need `isShallowEqual` as we can't guarantee referential equality
						// (E.g. if `selectedFonts` is coming from persisted state)
						const isSelected = !! selectedFonts && isShallowEqual( fontPair, selectedFonts );
						const { headings, base } = fontPair;

						return (
							<Button
								className={ classnames( 'style-preview__font-option', {
									'is-selected': isSelected,
								} ) }
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
				<div className="style-preview__font-options-mobile">
					<Button
						className={ classnames(
							'style-preview__font-option',
							'style-preview__font-option-select',
							{
								'is-open': isOpen,
							}
						) }
						onClick={ () => setIsOpen( ! isOpen ) }
					>
						<span className="style-preview__font-option-contents">
							{ selectedFontOption }
							<Icon icon={ chevronDown } size={ 22 } />
						</span>
					</Button>
					<div
						className={ classnames( 'style-preview__font-options-mobile-options', {
							'is-open': isOpen,
						} ) }
					>
						<Button
							className={ classnames(
								'style-preview__font-option',
								'style-preview__font-option-mobile',
								{
									'is-selected-dropdown-option':
										selectedFonts?.headings === selectedDesignDefaultFonts?.headings &&
										selectedFonts?.base === selectedDesignDefaultFonts?.base,
								}
							) }
							onClick={ () => setFontsAndClose( selectedDesignDefaultFonts ) }
						>
							<span className="style-preview__font-option-contents">{ defaultFontOption }</span>
						</Button>
						{ fontPairings.filter( fontPairingsFilter ).map( ( fontPair ) => {
							// Font pairs are objects, we need `isShallowEqual` as we can't guarantee referential equality
							// (E.g. if `selectedFonts` is coming from persisted state)
							const isSelected = !! selectedFonts && isShallowEqual( fontPair, selectedFonts );
							const { headings, base } = fontPair;

							return (
								<Button
									className={ classnames(
										'style-preview__font-option',
										'style-preview__font-option-mobile',
										{
											'is-selected-dropdown-option': isSelected,
										}
									) }
									onClick={ () => setFontsAndClose( fontPair ) }
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
				</div>
			</div>
		</>
	);
};

export default FontSelect;
