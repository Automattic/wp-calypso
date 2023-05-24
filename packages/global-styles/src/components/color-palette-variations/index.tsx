import { PremiumBadge } from '@automattic/design-picker';
import {
	__unstableComposite as Composite,
	__unstableUseCompositeState as useCompositeState,
	__unstableCompositeItem as CompositeItem,
} from '@wordpress/components';
import classnames from 'classnames';
import { translate } from 'i18n-calypso';
import { useMemo, useContext } from 'react';
import { GlobalStylesContext, mergeBaseAndUserConfigs } from '../../gutenberg-bridge';
import { useColorPaletteVariations } from '../../hooks';
import ColorPaletteVariationPreview from './preview';
import type { GlobalStylesObject } from '../../types';
import './style.scss';

interface ColorPaletteVariationProps {
	colorPaletteVariation: GlobalStylesObject;
	isActive: boolean;
	composite?: Record< string, unknown >;
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
	composite,
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
	return (
		<CompositeItem
			role="option"
			as="button"
			{ ...composite }
			className={ classnames( 'global-styles-variation__item', {
				'is-active': isActive,
			} ) }
			onClick={ onSelect }
			aria-current={ isActive }
			aria-label={
				translate( 'Color: %s', {
					comment: 'Aria label for color preview buttons',
					args: colorPaletteVariation.title ?? translate( 'Default' ),
				} ) as string
			}
		>
			<div className="global-styles-variation__item-preview">
				<GlobalStylesContext.Provider value={ context }>
					<ColorPaletteVariationPreview title={ colorPaletteVariation.title } />
				</GlobalStylesContext.Provider>
			</div>
		</CompositeItem>
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
	const composite = useCompositeState();
	return (
		<Composite
			{ ...composite }
			role="listbox"
			className="color-palette-variations"
			aria-label={ translate( 'Color palette variations' ) }
		>
			<ColorPaletteVariation
				key="base"
				colorPaletteVariation={ base }
				isActive={ ! selectedColorPaletteVariation }
				composite={ composite }
				onSelect={ () => onSelect( null ) }
			/>
			{ colorPaletteVariations.map( ( colorPaletteVariation, index ) => (
				<ColorPaletteVariation
					key={ index }
					colorPaletteVariation={ colorPaletteVariation }
					isActive={ colorPaletteVariation.title === selectedColorPaletteVariation?.title }
					composite={ composite }
					onSelect={ () => onSelect( colorPaletteVariation ) }
				/>
			) ) }
		</Composite>
	);
};

export default ColorPaletteVariations;
