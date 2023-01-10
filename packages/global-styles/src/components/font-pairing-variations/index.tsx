import { GlobalStylesContext } from '@wordpress/edit-site/build-module/components/global-styles/context';
import { mergeBaseAndUserConfigs } from '@wordpress/edit-site/build-module/components/global-styles/global-styles-provider';
import { useStyle } from '@wordpress/edit-site/build-module/components/global-styles/hooks';
import { ENTER } from '@wordpress/keycodes';
import classnames from 'classnames';
import { useState, useMemo, useContext } from 'react';
import { FONT_PAIRING_VARIATIONS } from '../../constants';
import FontPairingVariationPreview from './font-pairing-variation-preview';
import type { GlobalStylesObject } from '../../types';
import './style.scss';

interface FontPairingVariationProps {
	fontPairingVariation: GlobalStylesObject;
	isActive: boolean;
	selectFontPairingVariation: () => void;
}

const INITIAL_INDEX = -1;

const FontPairingVariation = ( {
	fontPairingVariation,
	isActive,
	selectFontPairingVariation,
}: FontPairingVariationProps ) => {
	const { base } = useContext( GlobalStylesContext );
	const context = useMemo( () => {
		return {
			user: fontPairingVariation,
			base,
			merged: mergeBaseAndUserConfigs( base, fontPairingVariation ),
		};
	}, [ fontPairingVariation, base ] );

	const selectOnEnter = ( event: React.KeyboardEvent ) => {
		if ( event.keyCode === ENTER ) {
			event.preventDefault();
			selectFontPairingVariation();
		}
	};

	return (
		<GlobalStylesContext.Provider value={ context }>
			<div
				className={ classnames( 'global-styles-variation__item', {
					'is-active': isActive,
				} ) }
				role="button"
				onClick={ selectFontPairingVariation }
				onKeyDown={ selectOnEnter }
				tabIndex={ 0 }
				aria-current={ isActive }
			>
				<div className="global-styles-variation__item-preview">
					<FontPairingVariationPreview />
				</div>
			</div>
		</GlobalStylesContext.Provider>
	);
};

const FontPairingVariations = () => {
	const [ selectedIndex, setSelectedIndex ] = useState( INITIAL_INDEX );
	const { base } = useContext( GlobalStylesContext );
	const [ , setTextFontFamily ] = useStyle( 'typography.fontFamily' );
	const [ , setHeadingFontFamily ] = useStyle( 'elements.heading.typography.fontFamily' );

	const selectFontPairingVariation = (
		fontPairingVariation: GlobalStylesObject,
		index: number
	) => {
		setSelectedIndex( index );
		setTextFontFamily( fontPairingVariation.styles.typography?.fontFamily );
		setHeadingFontFamily( fontPairingVariation.styles.elements?.heading?.typography?.fontFamily );
	};

	return (
		<div className="font-pairing-variations">
			<FontPairingVariation
				key="base"
				fontPairingVariation={ base }
				isActive={ selectedIndex === INITIAL_INDEX }
				selectFontPairingVariation={ () => selectFontPairingVariation( base, INITIAL_INDEX ) }
			/>
			{ FONT_PAIRING_VARIATIONS.map( ( fontPairingVariation, index ) => (
				<FontPairingVariation
					key={ index }
					fontPairingVariation={ fontPairingVariation }
					isActive={ selectedIndex === index }
					selectFontPairingVariation={ () =>
						selectFontPairingVariation( fontPairingVariation, index )
					}
				/>
			) ) }
		</div>
	);
};

export default FontPairingVariations;
