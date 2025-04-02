import { PremiumBadge } from '@automattic/components';
import {
	__unstableComposite as Composite,
	__unstableUseCompositeState as useCompositeState,
	__unstableCompositeItem as CompositeItem,
} from '@wordpress/components';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import { useMemo, useContext } from 'react';
import { InView, IntersectionObserverProps } from 'react-intersection-observer';
import {
	GlobalStylesContext,
	mergeBaseAndUserConfigs,
	withExperimentalBlockEditorProvider,
} from '../../gutenberg-bridge';
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
	limitGlobalStyles?: boolean;
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
	}, [ colorPaletteVariation.slug, base ] );
	return (
		<CompositeItem
			role="option"
			as="button"
			{ ...composite }
			className={ clsx( 'global-styles-variation__item', {
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
			<InView triggerOnce>
				{
					( ( { inView, ref } ) => (
						<div className="global-styles-variation__item-preview" ref={ ref }>
							{ ( isActive || inView ) && (
								<GlobalStylesContext.Provider value={ context }>
									<ColorPaletteVariationPreview />
								</GlobalStylesContext.Provider>
							) }
						</div>
					) ) as IntersectionObserverProps[ 'children' ]
				}
			</InView>
		</CompositeItem>
	);
};

const ColorPaletteVariations = ( {
	//siteId,
	stylesheet,
	selectedColorPaletteVariation,
	onSelect,
	limitGlobalStyles,
}: ColorPaletteVariationsProps ) => {
	const { base } = useContext( GlobalStylesContext );
	const colorPaletteVariations = useColorPaletteVariations( stylesheet ) ?? [];
	const composite = useCompositeState();

	return (
		<Composite
			{ ...composite }
			role="listbox"
			aria-label={ translate( 'Color palette variations' ) }
			className="global-styles-variations__container"
		>
			<div className="global-styles-variations__group">
				<h3 className="global-styles-variations__group-title">{ translate( 'Free style' ) }</h3>
				<div className="color-palette-variations">
					<ColorPaletteVariation
						key="base"
						colorPaletteVariation={ { ...base, title: translate( 'Free style' ) } }
						isActive={ ! selectedColorPaletteVariation }
						composite={ composite }
						onSelect={ () => onSelect( null ) }
					/>
				</div>
			</div>
			<div className="global-styles-variations__group">
				<h3 className="global-styles-variations__group-title">
					<span className="global-styles-variations__group-title-actual">
						{ translate( 'Premium styles' ) }
					</span>
					<PremiumBadge
						shouldHideTooltip
						shouldCompactWithAnimation
						labelText={
							limitGlobalStyles ? translate( 'Upgrade' ) : translate( 'Included in your plan' )
						}
					/>
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
			</div>
		</Composite>
	);
};

export default withExperimentalBlockEditorProvider( ColorPaletteVariations );
