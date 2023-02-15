import { GlobalStylesContext } from '@wordpress/edit-site/build-module/components/global-styles/context';
import { mergeBaseAndUserConfigs } from '@wordpress/edit-site/build-module/components/global-styles/global-styles-provider';
import { ENTER } from '@wordpress/keycodes';
import classnames from 'classnames';
import { translate } from 'i18n-calypso';
import { useState, useMemo, useContext } from 'react';
import { useColorPaletteVariations } from '../../hooks';
import ColorPaletteVariationPreview from './preview';
import type { GlobalStylesObject } from '../../types';
import './style.scss';

interface ColorPaletteVariationProps {
	colorPaletteVariation: GlobalStylesObject;
	isActive: boolean;
	selectColorPaletteVariation: () => void;
}

interface ColorPaletteVariationsProps {
	siteId: number | string;
	stylesheet: string;
}

const INITIAL_INDEX = -1;

const ColorPaletteVariation = ( {
	colorPaletteVariation,
	isActive,
	selectColorPaletteVariation,
}: ColorPaletteVariationProps ) => {
	const { base } = useContext( GlobalStylesContext );
	const context = useMemo( () => {
		return {
			user: colorPaletteVariation,
			base,
			merged: mergeBaseAndUserConfigs( base, colorPaletteVariation ),
		};
	}, [ colorPaletteVariation, base ] );

	const selectOnEnter = ( event: React.KeyboardEvent ) => {
		if ( event.keyCode === ENTER ) {
			event.preventDefault();
			selectColorPaletteVariation();
		}
	};

	return (
		<div
			className={ classnames( 'global-styles-variation__item', {
				'is-active': isActive,
			} ) }
			role="button"
			onClick={ selectColorPaletteVariation }
			onKeyDown={ selectOnEnter }
			tabIndex={ 0 }
			aria-current={ isActive }
			aria-label={
				translate( 'Color: %s', {
					comment: 'Aria label for color preview buttons',
					args: colorPaletteVariation.title,
				} ) as string
			}
		>
			<div className="global-styles-variation__item-preview">
				<GlobalStylesContext.Provider value={ context }>
					<ColorPaletteVariationPreview />
				</GlobalStylesContext.Provider>
			</div>
		</div>
	);
};

const ColorPaletteVariations = ( { siteId, stylesheet }: ColorPaletteVariationsProps ) => {
	const [ selectedIndex, setSelectedIndex ] = useState( INITIAL_INDEX );
	const { base } = useContext( GlobalStylesContext );
	const colorPaletteVariations = useColorPaletteVariations( siteId, stylesheet ) ?? [];

	const selectColorPaletteVariation = (
		colorPaletteVariation: GlobalStylesObject,
		index: number
	) => {
		setSelectedIndex( index );
	};

	return (
		<div className="color-palette-variations">
			<ColorPaletteVariation
				key="base"
				colorPaletteVariation={ base }
				isActive={ selectedIndex === INITIAL_INDEX }
				selectColorPaletteVariation={ () => selectColorPaletteVariation( base, INITIAL_INDEX ) }
			/>
			{ colorPaletteVariations.map( ( colorPaletteVariation, index ) => (
				<ColorPaletteVariation
					key={ index }
					colorPaletteVariation={ colorPaletteVariation }
					isActive={ selectedIndex === index }
					selectColorPaletteVariation={ () =>
						selectColorPaletteVariation( colorPaletteVariation, index )
					}
				/>
			) ) }
		</div>
	);
};

export default ColorPaletteVariations;
