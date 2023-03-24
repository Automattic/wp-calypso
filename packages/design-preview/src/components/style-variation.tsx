import { PremiumBadge } from '@automattic/design-picker';
import { GlobalStylesContext } from '@wordpress/edit-site/build-module/components/global-styles/context';
import { mergeBaseAndUserConfigs } from '@wordpress/edit-site/build-module/components/global-styles/global-styles-provider';
import { useMemo, useState } from '@wordpress/element';
import classnames from 'classnames';
import { translate } from 'i18n-calypso';
import Preview from './style-variation-preview';
import type { StyleVariation } from '@automattic/design-picker/src/types';
import './style.scss';

const SPACE_BAR_KEYCODE = 32;
const DEFAULT_VARIATION_SLUG = 'default';

interface StyleVariationPreviewProps {
	variation: StyleVariation;
	base?: StyleVariation;
	isSelected: boolean;
	isPremium: boolean;
	onClick: ( variation: StyleVariation ) => void;
	showGlobalStylesPremiumBadge: boolean;
	showOnlyHoverView?: boolean;
}

const StyleVariationPreview: React.FC< StyleVariationPreviewProps > = ( {
	variation,
	base = {},
	isSelected,
	isPremium,
	onClick,
	showGlobalStylesPremiumBadge,
	showOnlyHoverView,
} ) => {
	const [ isFocused, setIsFocused ] = useState( false );
	const context = useMemo( () => {
		return {
			user: {
				settings: variation.settings ?? {},
				styles: variation.styles ?? {},
			},
			base,
			merged: mergeBaseAndUserConfigs( base, variation ),
		};
	}, [ variation, base ] );

	return (
		<div className="design-preview__style-variation-wrapper">
			<div
				className={ classnames( 'design-preview__style-variation', {
					'design-preview__style-variation--is-selected': isSelected,
				} ) }
				tabIndex={ 0 }
				role="button"
				aria-label={
					translate( 'Style: %s', {
						comment: 'Aria label for style preview buttons',
						args: variation.title,
					} ) as string
				}
				onClick={ () => onClick( variation ) }
				onKeyDown={ ( e ) => e.keyCode === SPACE_BAR_KEYCODE && onClick( variation ) }
				onFocus={ () => setIsFocused( true ) }
				onBlur={ () => setIsFocused( false ) }
			>
				{ isPremium && showGlobalStylesPremiumBadge && (
					<PremiumBadge
						className="design-picker__premium-badge"
						labelText={ translate( 'Upgrade' ) }
						tooltipClassName="design-picker__premium-badge-tooltip"
						tooltipPosition="top"
						tooltipContent={ translate(
							'Unlock this style, and tons of other features, by upgrading to a Premium plan.'
						) }
						focusOnShow={ false }
					/>
				) }
				<GlobalStylesContext.Provider value={ context }>
					<Preview
						label={ variation.title }
						inlineCss={ variation.inline_css || '' }
						isFocused={ isFocused || showOnlyHoverView }
						withHoverView
					/>
				</GlobalStylesContext.Provider>
			</div>
		</div>
	);
};

interface StyleVariationPreviewsProps {
	variations: StyleVariation[];
	selectedVariation?: StyleVariation;
	onClick: ( variation: StyleVariation ) => void;
	showGlobalStylesPremiumBadge: boolean;
	showOnlyHoverViewDefaultVariation?: boolean;
}

const StyleVariationPreviews: React.FC< StyleVariationPreviewsProps > = ( {
	variations = [],
	selectedVariation,
	onClick,
	showGlobalStylesPremiumBadge,
	showOnlyHoverViewDefaultVariation,
} ) => {
	const selectedVariationSlug = selectedVariation?.slug ?? DEFAULT_VARIATION_SLUG;
	const base = useMemo(
		() => variations.find( ( variation ) => variation.slug === DEFAULT_VARIATION_SLUG ),
		[ variations ]
	);

	return (
		<>
			{ variations.map( ( variation ) => (
				<StyleVariationPreview
					key={ variation.slug }
					variation={ variation }
					base={ base }
					isSelected={ variation.slug === selectedVariationSlug }
					isPremium={ variation.slug !== DEFAULT_VARIATION_SLUG }
					onClick={ onClick }
					showGlobalStylesPremiumBadge={ showGlobalStylesPremiumBadge }
					showOnlyHoverView={
						showOnlyHoverViewDefaultVariation && variation.slug === DEFAULT_VARIATION_SLUG
					}
				/>
			) ) }
		</>
	);
};

export default StyleVariationPreviews;
