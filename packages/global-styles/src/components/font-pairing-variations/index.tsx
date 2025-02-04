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
import { useFontPairingVariations } from '../../hooks';
import FontPairingVariationPreview from './preview';
import type { GlobalStylesObject } from '../../types';
import './style.scss';

interface FontPairingVariationProps {
	fontPairingVariation?: GlobalStylesObject;
	isActive: boolean;
	composite?: Record< string, unknown >;
	onSelect: () => void;
}

interface FontPairingVariationsProps {
	siteId: number | string;
	stylesheet: string;
	selectedFontPairingVariation: GlobalStylesObject | null;
	onSelect: ( fontPairingVariation: GlobalStylesObject | null ) => void;
	limitGlobalStyles?: boolean;
}

const FontPairingVariation = ( {
	fontPairingVariation,
	isActive,
	composite,
	onSelect,
}: FontPairingVariationProps ) => {
	const { base } = useContext( GlobalStylesContext );
	const context = useMemo( () => {
		return {
			user: fontPairingVariation,
			base,
			merged: mergeBaseAndUserConfigs( base, fontPairingVariation ),
		};
	}, [ fontPairingVariation?.slug, base ] );
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
				translate( 'Font: %s', {
					comment: 'Aria label for font preview buttons',
					// The default font pairing has no title
					args: fontPairingVariation?.title ?? translate( 'Free font' ),
				} ) as string
			}
		>
			<InView triggerOnce>
				{
					( ( { inView, ref } ) => (
						<div className="global-styles-variation__item-preview" ref={ ref }>
							{ ( isActive || inView ) && (
								<GlobalStylesContext.Provider value={ context }>
									<FontPairingVariationPreview />
								</GlobalStylesContext.Provider>
							) }
						</div>
					) ) as IntersectionObserverProps[ 'children' ]
				}
			</InView>
		</CompositeItem>
	);
};

const FontPairingVariations = ( {
	//siteId,
	stylesheet,
	selectedFontPairingVariation,
	onSelect,
	limitGlobalStyles,
}: FontPairingVariationsProps ) => {
	// The theme font pairings don't include the default font pairing
	const fontPairingVariations = useFontPairingVariations( stylesheet ) ?? [];
	const composite = useCompositeState();
	return (
		<Composite
			{ ...composite }
			role="listbox"
			aria-label={ translate( 'Font pairing variations' ) }
			className="global-styles-variations__container"
		>
			<div className="global-styles-variations__group">
				<h3 className="global-styles-variations__group-title">{ translate( 'Free font' ) }</h3>
				<div className="font-pairing-variations">
					<FontPairingVariation
						key="base"
						// The base is the theme.json, which has the default font pairing
						isActive={ ! selectedFontPairingVariation }
						composite={ composite }
						onSelect={ () => onSelect( null ) }
					/>
				</div>
			</div>
			<div className="global-styles-variations__group">
				<h3 className="global-styles-variations__group-title">
					<span className="global-styles-variations__group-title-actual">
						{ translate( 'Premium fonts' ) }
					</span>
					<PremiumBadge
						shouldHideTooltip
						shouldCompactWithAnimation
						labelText={
							limitGlobalStyles ? translate( 'Upgrade' ) : translate( 'Included in your plan' )
						}
					/>
				</h3>
				<div className="font-pairing-variations">
					{ fontPairingVariations.map( ( fontPairingVariation, index ) => (
						<FontPairingVariation
							key={ index }
							fontPairingVariation={ fontPairingVariation }
							isActive={ fontPairingVariation.title === selectedFontPairingVariation?.title }
							composite={ composite }
							onSelect={ () => onSelect( fontPairingVariation ) }
						/>
					) ) }
				</div>
			</div>
		</Composite>
	);
};

export default withExperimentalBlockEditorProvider( FontPairingVariations );
