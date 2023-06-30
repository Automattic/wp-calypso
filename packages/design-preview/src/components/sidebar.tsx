import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import {
	GlobalStylesVariations,
	ColorPaletteVariations,
	FontPairingVariations,
} from '@automattic/global-styles';
import { NavigatorScreens, useNavigatorButtons } from '@automattic/onboarding';
import { useState } from '@wordpress/element';
import { color, styles, typography } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import type { Category, StyleVariation } from '@automattic/design-picker/src/types';
import type { GlobalStylesObject } from '@automattic/global-styles';
import type { NavigatorScreenObject } from '@automattic/onboarding';

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
	variations?: StyleVariation[];
	selectedVariation?: StyleVariation;
	onSelectVariation: ( variation: StyleVariation ) => void;
	splitPremiumVariations: boolean;
	onClickCategory?: ( category: Category ) => void;
	actionButtons: React.ReactNode;
	siteId: number;
	stylesheet: string;
	selectedColorVariation: GlobalStylesObject | null;
	onSelectColorVariation: ( variation: GlobalStylesObject | null ) => void;
	selectedFontVariation: GlobalStylesObject | null;
	onSelectFontVariation: ( variation: GlobalStylesObject | null ) => void;
	limitGlobalStyles: boolean;
	onNavigatorPathChange?: ( path: string ) => void;
}

const Sidebar: React.FC< SidebarProps > = ( {
	title,
	author,
	categories = [],
	pricingBadge,
	description,
	shortDescription,
	variations,
	selectedVariation,
	onSelectVariation,
	splitPremiumVariations,
	onClickCategory,
	actionButtons,
	siteId,
	stylesheet,
	selectedColorVariation,
	onSelectColorVariation,
	selectedFontVariation,
	onSelectFontVariation,
	limitGlobalStyles,
	onNavigatorPathChange,
} ) => {
	const translate = useTranslate();
	const [ isShowFullDescription, setIsShowFullDescription ] = useState( false );
	const isShowDescriptionToggle = shortDescription && description !== shortDescription;

	const screens = useMemo(
		() =>
			[
				variations &&
					variations.length > 0 && {
						icon: styles,
						label: translate( 'Styles' ),
						path: '/style-variations',
						content: (
							<div className="design-preview__sidebar-variations">
								<div className="design-preview__sidebar-variations-grid">
									<GlobalStylesVariations
										key="style-variations"
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
						),
						actionText: translate( 'Save styles' ),
					},
				variations &&
					variations.length === 0 &&
					isEnabled( 'signup/design-picker-preview-colors' ) && {
						icon: color,
						label: translate( 'Colors' ),
						path: '/color-palettes',
						title: translate( 'Colors' ),
						description: translate(
							'Choose from our curated color palettes when you upgrade to the Premium plan or above.'
						),
						content: (
							<div className="design-preview__sidebar-variations">
								<ColorPaletteVariations
									key="color-variations"
									siteId={ siteId }
									stylesheet={ stylesheet }
									selectedColorPaletteVariation={ selectedColorVariation }
									limitGlobalStyles={ limitGlobalStyles }
									onSelect={ onSelectColorVariation }
								/>
							</div>
						),
						actionText: translate( 'Save colors' ),
					},
				variations &&
					variations.length === 0 &&
					isEnabled( 'signup/design-picker-preview-fonts' ) && {
						icon: typography,
						label: translate( 'Fonts' ),
						path: '/font-pairings',
						title: translate( 'Fonts' ),
						description: translate(
							'Choose from our curated font pairings when you upgrade to the Premium plan or above.'
						),
						content: (
							<div key="font-variations" className="design-preview__sidebar-variations">
								<FontPairingVariations
									siteId={ siteId }
									stylesheet={ stylesheet }
									selectedFontPairingVariation={ selectedFontVariation }
									limitGlobalStyles={ limitGlobalStyles }
									onSelect={ onSelectFontVariation }
								/>
							</div>
						),
						actionText: translate( 'Save fonts' ),
					},
			].filter( Boolean ) as NavigatorScreenObject[],
		[
			variations,
			siteId,
			stylesheet,
			selectedVariation,
			selectedColorVariation,
			selectedFontVariation,
		]
	);

	const navigatorButtons = useNavigatorButtons( screens );

	return (
		<div className="design-preview__sidebar">
			<div className="design-preview__sidebar-content">
				<NavigatorScreens screens={ screens } onNavigatorPathChange={ onNavigatorPathChange }>
					<>
						<div className="design-preview__sidebar-header">
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
													{ isShowFullDescription
														? translate( 'Read less' )
														: translate( 'Read more' ) }
												</Button>
											</>
										) : (
											description ?? shortDescription
										) }
									</p>
								</div>
							) }
						</div>
						{ navigatorButtons }
						{ actionButtons && (
							<div className="design-preview__sidebar-action-buttons">{ actionButtons }</div>
						) }
					</>
				</NavigatorScreens>
			</div>
		</div>
	);
};

export default Sidebar;
