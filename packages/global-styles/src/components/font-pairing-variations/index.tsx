import { GlobalStylesContext } from '@wordpress/edit-site/build-module/components/global-styles/context';
import { mergeBaseAndUserConfigs } from '@wordpress/edit-site/build-module/components/global-styles/global-styles-provider';
import { ENTER } from '@wordpress/keycodes';
import classnames from 'classnames';
import { useMemo, useContext } from 'react';
import { useFontPairingVariations } from '../../hooks';
import FontPairingVariationPreview from './preview';
import type { GlobalStylesObject } from '../../types';
import './style.scss';

interface FontPairingVariationProps {
	fontPairingVariation: GlobalStylesObject;
	isActive: boolean;
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

	const selectOnEnter = ( event: React.KeyboardEvent ) => {
		if ( event.keyCode === ENTER ) {
			event.preventDefault();
			onSelect();
		}
	};

	return (
		<GlobalStylesContext.Provider value={ context }>
			<div
				className={ classnames( 'global-styles-variation__item', {
					'is-active': isActive,
				} ) }
				role="button"
				onClick={ onSelect }
				onKeyDown={ selectOnEnter }
				tabIndex={ 0 }
				aria-current={ isActive }
			>
				<div className="global-styles-variation__item-preview">
					<FontPairingVariationPreview title={ fontPairingVariation.title } />
				</div>
			</div>
		</GlobalStylesContext.Provider>
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

	return (
		<div className="font-pairing-variations">
			<FontPairingVariation
				key="base"
				fontPairingVariation={ base }
				isActive={ ! selectedFontPairingVariation }
				onSelect={ () => onSelect( null ) }
			/>
			{ fontPairingVariations.map( ( fontPairingVariation, index ) => (
				<FontPairingVariation
					key={ index }
					fontPairingVariation={ fontPairingVariation }
					isActive={ fontPairingVariation.title === selectedFontPairingVariation?.title }
					onSelect={ () => onSelect( fontPairingVariation ) }
				/>
			) ) }
		</div>
	);
};

export default FontPairingVariations;
