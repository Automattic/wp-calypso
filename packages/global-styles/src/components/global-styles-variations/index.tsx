import { GlobalStylesContext } from '@wordpress/edit-site/build-module/components/global-styles/context';
import { mergeBaseAndUserConfigs } from '@wordpress/edit-site/build-module/components/global-styles/global-styles-provider';
import { useState } from '@wordpress/element';
import { ENTER } from '@wordpress/keycodes';
import classnames from 'classnames';
import { translate } from 'i18n-calypso';
import { useMemo, useContext } from 'react';
import { DEFAULT_GLOBAL_STYLES_VARIATION_SLUG } from '../../constants';
import GlobalStylesVariationPreview from './preview';
import type { GlobalStylesObject } from '../../types';
import './style.scss';

interface GlobalStylesVariationProps {
	globalStylesVariation: GlobalStylesObject;
	isActive: boolean;
	premiumBadge?: React.ReactNode;
	showOnlyHoverView?: boolean;
	onSelect: () => void;
}

interface GlobalStylesVariationsProps {
	globalStylesVariations: GlobalStylesObject[];
	selectedGlobalStylesVariation: GlobalStylesObject | null;
	premiumBadge?: React.ReactNode;
	showOnlyHoverViewDefaultVariation?: boolean;
	onSelect: ( globalStylesVariation: GlobalStylesObject ) => void;
}

const isDefaultGlobalStyleVariationSlug = ( globalStylesVariation: GlobalStylesObject ) =>
	globalStylesVariation.slug === DEFAULT_GLOBAL_STYLES_VARIATION_SLUG;

const GlobalStylesVariation = ( {
	globalStylesVariation,
	isActive,
	premiumBadge,
	showOnlyHoverView,
	onSelect,
}: GlobalStylesVariationProps ) => {
	const [ isFocused, setIsFocused ] = useState( false );
	const { base } = useContext( GlobalStylesContext );
	const context = useMemo( () => {
		return {
			user: globalStylesVariation,
			base,
			merged: mergeBaseAndUserConfigs( base, globalStylesVariation ),
		};
	}, [ globalStylesVariation, base ] );

	const selectOnEnter = ( event: React.KeyboardEvent ) => {
		if ( event.keyCode === ENTER ) {
			event.preventDefault();
			onSelect();
		}
	};

	return (
		<div
			className={ classnames( 'global-styles-variations__item', {
				'is-active': isActive,
			} ) }
			role="button"
			onBlur={ () => setIsFocused( false ) }
			onFocus={ () => setIsFocused( true ) }
			onClick={ onSelect }
			onKeyDown={ selectOnEnter }
			tabIndex={ 0 }
			aria-current={ isActive }
			aria-label={
				translate( 'Style: %s', {
					comment: 'Aria label for style preview buttons',
					args: globalStylesVariation.title,
				} ) as string
			}
		>
			{ premiumBadge }
			<div className="global-styles-variation__item-preview">
				<GlobalStylesContext.Provider value={ context }>
					<GlobalStylesVariationPreview
						title={ globalStylesVariation.title }
						isFocused={ isFocused || showOnlyHoverView }
					/>
				</GlobalStylesContext.Provider>
			</div>
		</div>
	);
};

const GlobalStylesVariations = ( {
	globalStylesVariations,
	selectedGlobalStylesVariation,
	premiumBadge,
	showOnlyHoverViewDefaultVariation,
	onSelect,
}: GlobalStylesVariationsProps ) => {
	const baseGlobalStyles = useMemo(
		() =>
			globalStylesVariations.find( ( globalStylesVariation ) =>
				isDefaultGlobalStyleVariationSlug( globalStylesVariation )
			) ?? ( {} as GlobalStylesObject ),
		[ globalStylesVariations ]
	);

	const globalStylesVariationsWithoutDefault = useMemo(
		() =>
			globalStylesVariations.filter(
				( globalStylesVariation ) => ! isDefaultGlobalStyleVariationSlug( globalStylesVariation )
			),
		[ globalStylesVariations ]
	);

	return (
		<GlobalStylesContext.Provider value={ { base: baseGlobalStyles } }>
			<div className="global-styles-variations">
				<GlobalStylesVariation
					key="base"
					globalStylesVariation={ baseGlobalStyles }
					isActive={
						! selectedGlobalStylesVariation ||
						isDefaultGlobalStyleVariationSlug( selectedGlobalStylesVariation )
					}
					showOnlyHoverView={ showOnlyHoverViewDefaultVariation }
					onSelect={ () => onSelect( baseGlobalStyles ) }
				/>
				{ globalStylesVariationsWithoutDefault.map( ( globalStylesVariation, index ) => (
					<GlobalStylesVariation
						key={ index }
						globalStylesVariation={ globalStylesVariation }
						premiumBadge={ premiumBadge }
						isActive={ globalStylesVariation.slug === selectedGlobalStylesVariation?.slug }
						onSelect={ () => onSelect( globalStylesVariation ) }
					/>
				) ) }
			</div>
		</GlobalStylesContext.Provider>
	);
};

export default GlobalStylesVariations;
