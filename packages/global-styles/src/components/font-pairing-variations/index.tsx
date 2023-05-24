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
import { useFontPairingVariations } from '../../hooks';
import FontPairingVariationPreview from './preview';
import type { GlobalStylesObject } from '../../types';
import './style.scss';

interface FontPairingVariationProps {
	fontPairingVariation: GlobalStylesObject;
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
					args: fontPairingVariation.title ?? translate( 'Default' ),
				} ) as string
			}
		>
			<div className="global-styles-variation__item-preview">
				<GlobalStylesContext.Provider value={ context }>
					<FontPairingVariationPreview title={ fontPairingVariation.title } />
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
	const { base } = useContext( GlobalStylesContext );
	const fontPairingVariations = useFontPairingVariations( siteId, stylesheet ) ?? [];
	const composite = useCompositeState();
	return (
		<Composite
			{ ...composite }
			role="listbox"
			className="font-pairing-variations"
			aria-label={ translate( 'Font pairing variations' ) }
		>
			<FontPairingVariation
				key="base"
				fontPairingVariation={ base }
				isActive={ ! selectedFontPairingVariation }
				composite={ composite }
				onSelect={ () => onSelect( null ) }
			/>
			{ fontPairingVariations.map( ( fontPairingVariation, index ) => (
				<FontPairingVariation
					key={ index }
					fontPairingVariation={ fontPairingVariation }
					isActive={ fontPairingVariation.title === selectedFontPairingVariation?.title }
					composite={ composite }
					onSelect={ () => onSelect( fontPairingVariation ) }
				/>
			) ) }
		</Composite>
	);
};

export default FontPairingVariations;
