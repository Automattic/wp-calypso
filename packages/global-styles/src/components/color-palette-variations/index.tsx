import { GlobalStylesContext } from '@wordpress/edit-site/build-module/components/global-styles/context';
import { mergeBaseAndUserConfigs } from '@wordpress/edit-site/build-module/components/global-styles/global-styles-provider';
import { ENTER } from '@wordpress/keycodes';
import classnames from 'classnames';
import { translate } from 'i18n-calypso';
import { useMemo, useContext } from 'react';
import { useColorPaletteVariations } from '../../hooks';
import ColorPaletteVariationPreview from './preview';
import type { GlobalStylesObject } from '../../types';
import './style.scss';

interface ColorPaletteVariationProps {
	colorPaletteVariation: GlobalStylesObject;
	isActive: boolean;
	onSelect: () => void;
}

interface ColorPaletteVariationsProps {
	siteId: number | string;
	stylesheet: string;
	selectedColorPaletteVariation: GlobalStylesObject | null;
	onSelect: ( colorPaletteVariation: GlobalStylesObject | null ) => void;
}

const ColorPaletteVariation = ( {
	colorPaletteVariation,
	isActive,
	onSelect,
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
			onSelect();
		}
	};

	return (
		<div
			className={ classnames( 'global-styles-variation__item', {
				'is-active': isActive,
			} ) }
			role="button"
			onClick={ onSelect }
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
					<ColorPaletteVariationPreview title={ colorPaletteVariation.title } />
				</GlobalStylesContext.Provider>
			</div>
		</div>
	);
};

const ColorPaletteVariations = ( {
	siteId,
	stylesheet,
	selectedColorPaletteVariation,
	onSelect,
}: ColorPaletteVariationsProps ) => {
	const { base } = useContext( GlobalStylesContext );
	const colorPaletteVariations = useColorPaletteVariations( siteId, stylesheet ) ?? [];

	return (
		<div className="color-palette-variations">
			<ColorPaletteVariation
				key="base"
				colorPaletteVariation={ base }
				isActive={ ! selectedColorPaletteVariation }
				onSelect={ () => onSelect( null ) }
			/>
			{ colorPaletteVariations.map( ( colorPaletteVariation, index ) => (
				<ColorPaletteVariation
					key={ index }
					colorPaletteVariation={ colorPaletteVariation }
					isActive={ colorPaletteVariation.title === selectedColorPaletteVariation?.title }
					onSelect={ () => onSelect( colorPaletteVariation ) }
				/>
			) ) }
		</div>
	);
};

export default ColorPaletteVariations;
