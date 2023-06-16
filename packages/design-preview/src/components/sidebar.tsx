import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { GlobalStylesVariations, FontPairingVariations } from '@automattic/global-styles';
import { useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import StyleHeading from './style-heading';
import type { Category, StyleVariation } from '@automattic/design-picker/src/types';
import type { GlobalStylesObject } from '@automattic/global-styles';

interface CategoryBadgeProps {
	category: Category;
	onClick?: ( category: Category ) => void;
}

const CategoryBadge: React.FC< CategoryBadgeProps > = ( { category, onClick } ) => {
	if ( ! onClick ) {
		return <div className="design-preview__sidebar-badge-category">{ category.name }</div>;
	}

	return (
		<button
			className="design-preview__sidebar-badge-category"
			onClick={ () => onClick( category ) }
		>
			{ category.name }
		</button>
	);
};

interface SidebarProps {
	title?: string;
	author?: string;
	categories?: Category[];
	description?: string;
	shortDescription?: string;
	pricingBadge?: React.ReactNode;
	variations: StyleVariation[];
	selectedVariation?: StyleVariation;
	onSelectVariation: ( variation: StyleVariation ) => void;
	splitPremiumVariations: boolean;
	onClickCategory?: ( category: Category ) => void;
	actionButtons: React.ReactNode;
	siteId: number;
	stylesheet: string;
	selectedFontVariation: GlobalStylesObject | null;
	onSelectFontVariation: ( variation: GlobalStylesObject | null ) => void;
}

const Sidebar: React.FC< SidebarProps > = ( {
	title,
	author,
	categories = [],
	pricingBadge,
	description,
	shortDescription,
	variations = [],
	selectedVariation,
	onSelectVariation,
	splitPremiumVariations,
	onClickCategory,
	actionButtons,
	siteId,
	stylesheet,
	selectedFontVariation,
	onSelectFontVariation,
} ) => {
	const translate = useTranslate();
	const [ isShowFullDescription, setIsShowFullDescription ] = useState( false );
	const isShowDescriptionToggle = shortDescription && description !== shortDescription;

	return (
		<div className="design-preview__sidebar">
			<div className="design-preview__sidebar-content">
				<div className="design-preview__sidebar-title">
					<h1>{ title }</h1>
				</div>
				{ author && (
					<div className="design-preview__sidebar-author">
						{ translate( 'By %(author)s', { args: { author } } ) }
					</div>
				) }
				{ ( pricingBadge || categories.length > 0 ) && (
					<div className="design-preview__sidebar-badges">
						{ pricingBadge }
						{ categories.map( ( category ) => (
							<CategoryBadge
								key={ category.slug }
								category={ category }
								onClick={ onClickCategory }
							/>
						) ) }
					</div>
				) }
				{ ( description || shortDescription ) && (
					<div className="design-preview__sidebar-description">
						<p>
							{ isShowDescriptionToggle ? (
								<>
									{ isShowFullDescription ? description : shortDescription }
									<Button
										borderless
										onClick={ () => setIsShowFullDescription( ! isShowFullDescription ) }
									>
										{ isShowFullDescription ? translate( 'Read less' ) : translate( 'Read more' ) }
									</Button>
								</>
							) : (
								description ?? shortDescription
							) }
						</p>
					</div>
				) }
				{ variations.length > 0 && (
					<div className="design-preview__sidebar-variations">
						<div className="design-preview__sidebar-variations-grid">
							<GlobalStylesVariations
								globalStylesVariations={ variations as GlobalStylesObject[] }
								selectedGlobalStylesVariation={ selectedVariation as GlobalStylesObject }
								splitPremiumVariations={ splitPremiumVariations }
								displayFreeLabel={ splitPremiumVariations }
								showOnlyHoverViewDefaultVariation={ false }
								onSelect={ ( globalStyleVariation: GlobalStylesObject ) =>
									onSelectVariation( globalStyleVariation as StyleVariation )
								}
							/>
						</div>
					</div>
				) }
				{ ! variations.length && isEnabled( 'signup/design-picker-preview-fonts' ) && (
					<div className="design-preview__sidebar-variations">
						<StyleHeading
							title={ translate( 'Fonts' ) }
							description={ translate(
								'Choose from our curated font pairings when you upgrade to the Premium plan or above.'
							) }
							isPremium
						/>
						<FontPairingVariations
							siteId={ siteId }
							stylesheet={ stylesheet }
							selectedFontPairingVariation={ selectedFontVariation }
							onSelect={ onSelectFontVariation }
						/>
					</div>
				) }
			</div>
			{ actionButtons && (
				<div className="design-preview__sidebar-action-buttons">{ actionButtons }</div>
			) }
		</div>
	);
};

export default Sidebar;
