import { GlobalStylesContext } from '@wordpress/edit-site/build-module/components/global-styles/context';
import { mergeBaseAndUserConfigs } from '@wordpress/edit-site/build-module/components/global-styles/global-styles-provider';
import { useState } from '@wordpress/element';
import { ENTER } from '@wordpress/keycodes';
import classnames from 'classnames';
import { translate, TranslateResult } from 'i18n-calypso';
import { useMemo, useContext } from 'react';
import { DEFAULT_GLOBAL_STYLES_VARIATION_SLUG } from '../../constants';
import GlobalStylesVariationPreview from './preview';
import type { GlobalStylesObject } from '../../types';
import './style.scss';

interface GlobalStylesVariationProps {
	globalStylesVariation: GlobalStylesObject;
	isActive: boolean;
	showOnlyHoverView?: boolean;
	onSelect: () => void;
}

interface GlobalStylesVariationsProps {
	globalStylesVariations: GlobalStylesObject[];
	selectedGlobalStylesVariation: GlobalStylesObject | null;
	description?: TranslateResult;
	showOnlyHoverViewDefaultVariation?: boolean;
	onSelect: ( globalStylesVariation: GlobalStylesObject ) => void;
}

const isDefaultGlobalStyleVariationSlug = ( globalStylesVariation: GlobalStylesObject ) =>
	globalStylesVariation.slug === DEFAULT_GLOBAL_STYLES_VARIATION_SLUG;

const GlobalStylesVariation = ( {
	globalStylesVariation,
	isActive,
	showOnlyHoverView,
	onSelect,
}: GlobalStylesVariationProps ) => {
	const [ isFocused, setIsFocused ] = useState( false );
	const { base } = useContext( GlobalStylesContext );
	const context = useMemo( () => {
		const { inline_css: globalStylesVariationInlineCss = '' } = globalStylesVariation;
		const baseInlineCss = base.inline_css || '';
		return {
			user: globalStylesVariation,
			base,
			merged: mergeBaseAndUserConfigs( base, globalStylesVariation ),
			inline_css: baseInlineCss + globalStylesVariationInlineCss,
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
			{ globalStylesVariation.slug === DEFAULT_GLOBAL_STYLES_VARIATION_SLUG && (
				<div className="global-styles-variations__free-badge">
					<span>{ translate( 'Free' ) }</span>
				</div>
			) }
			<div className="global-styles-variation__item-preview">
				<GlobalStylesContext.Provider value={ context }>
					<GlobalStylesVariationPreview
						title={ globalStylesVariation.title }
						inlineCss={ context.inline_css }
						isFocused={ isFocused || showOnlyHoverView }
						onFocusOut={ () => setIsFocused( false ) }
					/>
				</GlobalStylesContext.Provider>
			</div>
		</div>
	);
};

const GlobalStylesVariations = ( {
	globalStylesVariations,
	selectedGlobalStylesVariation,
	description,
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

	const premiumStylesDescription =
		description ??
		translate(
			'Unlock premium styles and tons of other features with the Premium plan, or try them out now for free.'
		);

	return (
		<GlobalStylesContext.Provider value={ { base: baseGlobalStyles } }>
			<div className="global-styles-variations__container">
				<div className="global-styles-variations__type">
					<div className="global-styles-variations__header">
						<h2>
							{ translate( 'Default style' ) }
							<div className="global-styles-variations__free-badge">
								<span>{ translate( 'Free' ) }</span>
							</div>
						</h2>
					</div>
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
					</div>
				</div>
				<div className="global-styles-variations__type">
					<div className="global-styles-variations__header">
						<h2> { translate( 'Premium styles' ) } </h2>
						<div>
							<p>{ premiumStylesDescription }</p>
						</div>
					</div>
					<div className="global-styles-variations">
						{ globalStylesVariationsWithoutDefault.map( ( globalStylesVariation, index ) => (
							<GlobalStylesVariation
								key={ index }
								globalStylesVariation={ globalStylesVariation }
								isActive={ globalStylesVariation.slug === selectedGlobalStylesVariation?.slug }
								onSelect={ () => onSelect( globalStylesVariation ) }
							/>
						) ) }
					</div>
				</div>
			</div>
		</GlobalStylesContext.Provider>
	);
};

export default GlobalStylesVariations;
