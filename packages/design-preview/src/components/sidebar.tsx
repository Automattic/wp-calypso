import { Button } from '@automattic/components';
import { NavigatorScreens, useNavigatorButtons } from '@automattic/onboarding';
import { useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import type { Category } from '@automattic/design-picker/src/types';
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
	screens: NavigatorScreenObject[];
	actionButtons: React.ReactNode;
	onClickCategory?: ( category: Category ) => void;
	onNavigatorPathChange?: ( path: string ) => void;
}

const Sidebar: React.FC< SidebarProps > = ( {
	title,
	author,
	categories = [],
	pricingBadge,
	description,
	shortDescription,
	screens,
	actionButtons,
	onClickCategory,
	onNavigatorPathChange,
} ) => {
	const translate = useTranslate();
	const [ isShowFullDescription, setIsShowFullDescription ] = useState( false );
	const isShowDescriptionToggle = shortDescription && description !== shortDescription;
	const navigatorButtons = useNavigatorButtons( screens );

	return (
		<div className="design-preview__sidebar">
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
	);
};

export default Sidebar;
