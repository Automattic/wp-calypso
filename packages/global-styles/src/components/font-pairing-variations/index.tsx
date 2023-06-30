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
	}, [ fontPairingVariation, base ] );

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
				translate( 'Font: %s', {
					comment: 'Aria label for font preview buttons',
					// The default font pairing has no title
					args: fontPairingVariation?.title ?? translate( 'Free font' ),
				} ) as string
			}
		>
			<div className="global-styles-variation__item-preview">
				<GlobalStylesContext.Provider value={ context }>
					<FontPairingVariationPreview />
				</GlobalStylesContext.Provider>
			</div>
		</CompositeItem>
	);
};

const FontPairingVariations = ( {
	siteId,
	stylesheet,
	selectedFontPairingVariation,
	onSelect,
}: FontPairingVariationsProps ) => {
	// The theme font pairings don't include the default font pairing
	const fontPairingVariations = useFontPairingVariations( siteId, stylesheet ) ?? [];
	const composite = useCompositeState();

	return (
		<Composite
			{ ...composite }
			role="listbox"
			aria-label={ translate( 'Font pairing variations' ) }
		>
			<h3 className="global-styles-variation__title">{ translate( 'Free font' ) }</h3>
			<div className="font-pairing-variations">
				<FontPairingVariation
					key="base"
					// The base is the theme.json, which has the default font pairing
					isActive={ ! selectedFontPairingVariation }
					composite={ composite }
					onSelect={ () => onSelect( null ) }
				/>
			</div>
			<h3 className="global-styles-variation__title">
				{ translate( 'Premium fonts' ) }
				<PremiumBadge shouldHideTooltip shouldCompactWithAnimation />
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
		</Composite>
	);
};

export default FontPairingVariations;
