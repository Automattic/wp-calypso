import { isEnabled } from '@automattic/calypso-config';
import { GlobalStylesContext } from '@wordpress/edit-site/build-module/components/global-styles/context';
import { mergeBaseAndUserConfigs } from '@wordpress/edit-site/build-module/components/global-styles/global-styles-provider';
import Preview from '@wordpress/edit-site/build-module/components/global-styles/preview';
import { useMemo } from '@wordpress/element';
import classnames from 'classnames';
import { translate } from 'i18n-calypso';
// eslint-disable-next-line no-restricted-imports
import PremiumBadge from 'calypso/components/premium-badge';
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
}

const StyleVariationPreview: React.FC< StyleVariationPreviewProps > = ( {
	variation,
	base = {},
	isSelected,
	isPremium,
	onClick,
} ) => {
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
			>
				{ isEnabled( 'limit-global-styles' ) && isPremium && (
					<PremiumBadge
						tooltipText={ translate(
							'You can try this premium style out before upgrading your plan.'
						) }
					/>
				) }
				<GlobalStylesContext.Provider value={ context }>
					<Preview label={ variation.title } />
				</GlobalStylesContext.Provider>
			</div>
		</div>
	);
};

interface StyleVariationPreviewsProps {
	variations: StyleVariation[];
	selectedVariation?: StyleVariation;
	onClick: ( variation: StyleVariation ) => void;
}

const StyleVariationPreviews: React.FC< StyleVariationPreviewsProps > = ( {
	variations = [],
	selectedVariation,
	onClick,
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
				/>
			) ) }
		</>
	);
};

export default StyleVariationPreviews;
