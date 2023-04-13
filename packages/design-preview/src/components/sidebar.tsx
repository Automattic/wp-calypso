import { Button } from '@automattic/components';
import { useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import StyleVariationPreviews from './style-variation';
import type { Category, StyleVariation } from '@automattic/design-picker/src/types';

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
	onClickCategory?: ( category: Category ) => void;
	actionButtons: React.ReactNode;
	showGlobalStylesPremiumBadge: boolean;
	patternAssemblerCTA?: React.ReactNode;
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
	onClickCategory,
	actionButtons,
	showGlobalStylesPremiumBadge,
	patternAssemblerCTA,
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
						<h2>{ translate( 'Choose your style' ) }</h2>
						<p>{ translate( 'You can change your style at any time.' ) }</p>
						<div className="design-preview__sidebar-variations-grid">
							<StyleVariationPreviews
								variations={ variations }
								selectedVariation={ selectedVariation }
								onClick={ onSelectVariation }
								showGlobalStylesPremiumBadge={ showGlobalStylesPremiumBadge }
							/>
						</div>
					</div>
				) }
			</div>
			{ actionButtons && (
				<div className="design-preview__sidebar-action-buttons">{ actionButtons }</div>
			) }
			{ patternAssemblerCTA }
		</div>
	);
};

export default Sidebar;
