import { GlobalStylesContext } from '@wordpress/edit-site/build-module/components/global-styles/context';
import { mergeBaseAndUserConfigs } from '@wordpress/edit-site/build-module/components/global-styles/global-styles-provider';
import Preview from '@wordpress/edit-site/build-module/components/global-styles/preview';
import { useMemo } from '@wordpress/element';
import type { StyleVariation } from '@automattic/design-picker';
import './style.scss';

interface StyleVariationPreviewProps {
	variation: StyleVariation;
	base?: StyleVariation;
}

const StyleVariationPreview: React.FC< StyleVariationPreviewProps > = ( {
	variation,
	base = {},
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
		<div className="design-preview__style-variation" tabIndex={ 0 } role="button">
			<GlobalStylesContext.Provider value={ context }>
				<Preview label={ variation.title } />
			</GlobalStylesContext.Provider>
		</div>
	);
};

interface StyleVariationPreviewsProps {
	variations?: StyleVariation[];
}

const StyleVariationPreviews: React.FC< StyleVariationPreviewsProps > = ( { variations = [] } ) => {
	const base = useMemo(
		() => variations.find( ( variation ) => variation.slug === 'default' ),
		[ variations ]
	);

	return (
		<>
			{ variations.map( ( variation ) => (
				<StyleVariationPreview key={ variation.slug } variation={ variation } base={ base } />
			) ) }
		</>
	);
};

export default StyleVariationPreviews;
