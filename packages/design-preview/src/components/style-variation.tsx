import { GlobalStylesContext } from '@wordpress/edit-site/build-module/components/global-styles/context';
import { mergeBaseAndUserConfigs } from '@wordpress/edit-site/build-module/components/global-styles/global-styles-provider';
import Preview from '@wordpress/edit-site/build-module/components/global-styles/preview';
import { useMemo } from '@wordpress/element';
import classnames from 'classnames';
import type { StyleVariation } from '@automattic/design-picker/src/types';
import './style.scss';

const SPACE_BAR_KEYCODE = 32;

interface StyleVariationPreviewProps {
	variation: StyleVariation;
	isActive: boolean;
	base?: StyleVariation;
	onClick?: ( variation: StyleVariation ) => void;
}

const StyleVariationPreview: React.FC< StyleVariationPreviewProps > = ( {
	variation,
	isActive,
	base = {},
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
		<div
			className={ classnames( 'design-preview__style-variation', {
				'design-preview__style-variation--is-active': isActive,
			} ) }
			tabIndex={ 0 }
			role="button"
			onClick={ () => onClick?.( variation ) }
			onKeyDown={ ( e ) => e.keyCode === SPACE_BAR_KEYCODE && onClick?.( variation ) }
		>
			<GlobalStylesContext.Provider value={ context }>
				<Preview label={ variation.title } />
			</GlobalStylesContext.Provider>
		</div>
	);
};

interface StyleVariationPreviewsProps {
	variations?: StyleVariation[];
	activeVariation?: StyleVariation;
	onClick?: ( variation: StyleVariation ) => void;
}

const StyleVariationPreviews: React.FC< StyleVariationPreviewsProps > = ( {
	variations = [],
	activeVariation,
	onClick,
} ) => {
	const base = useMemo(
		() => variations.find( ( variation ) => variation.slug === 'default' ),
		[ variations ]
	);

	return (
		<>
			{ variations.map( ( variation ) => (
				<StyleVariationPreview
					key={ variation.slug }
					variation={ variation }
					base={ base }
					isActive={ activeVariation?.slug === variation.slug }
					onClick={ onClick }
				/>
			) ) }
		</>
	);
};

export default StyleVariationPreviews;
