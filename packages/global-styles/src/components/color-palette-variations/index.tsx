import { PremiumBadge } from '@automattic/design-picker';
import {
	__unstableComposite as Composite,
	__unstableUseCompositeState as useCompositeState,
	__unstableCompositeItem as CompositeItem,
} from '@wordpress/components';
import { GlobalStylesContext } from '@wordpress/edit-site/build-module/components/global-styles/context';
import { mergeBaseAndUserConfigs } from '@wordpress/edit-site/build-module/components/global-styles/global-styles-provider';
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
	composite?: Record< string, unknown >;
	onSelect: () => void;
}

interface ColorPaletteVariationsProps {
	siteId: number | string;
	stylesheet: string;
	selectedColorPaletteVariation: GlobalStylesObject | null;
	onSelect: ( colorPaletteVariation: GlobalStylesObject | null ) => void;
	limitGlobalStyles: boolean;
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
					args: colorPaletteVariation.title ?? translate( 'Free style' ),
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
	limitGlobalStyles,
}: ColorPaletteVariationsProps ) => {
	const { base } = useContext( GlobalStylesContext );
	const colorPaletteVariations = useColorPaletteVariations( siteId, stylesheet ) ?? [];
	const composite = useCompositeState();

	return (
		<Composite
			{ ...composite }
			role="listbox"
			aria-label={ translate( 'Color palette variations' ) }
		>
			<h3 className="global-styles-variation__title">{ translate( 'Free style' ) }</h3>
			<div className="color-palette-variations">
				<ColorPaletteVariation
					key="base"
					colorPaletteVariation={ { ...base, title: translate( 'Free style' ) } }
					isActive={ ! selectedColorPaletteVariation }
					composite={ composite }
					onSelect={ () => onSelect( null ) }
				/>
			</div>
			<h3 className="global-styles-variation__title">
				{ translate( 'Custom styles' ) }
				{ limitGlobalStyles && (
					<PremiumBadge
						shouldHideTooltip
						shouldCompactWithAnimation
						labelText={ translate( 'Upgrade' ) }
					/>
				) }
			</h3>
			<div className="color-palette-variations">
				{ colorPaletteVariations.map( ( colorPaletteVariation, index ) => (
					<ColorPaletteVariation
						key={ index }
						colorPaletteVariation={ colorPaletteVariation }
						isActive={ colorPaletteVariation.title === selectedColorPaletteVariation?.title }
						composite={ composite }
						onSelect={ () => onSelect( colorPaletteVariation ) }
					/>
				) ) }
			</div>
		</Composite>
	);
};

export default ColorPaletteVariations;
