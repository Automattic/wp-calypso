import { NavigatorScreens, useNavigatorButtons } from '@automattic/onboarding';
import { Navigator } from '@wordpress/components/build-types/navigator/types';
import { Element, useMemo } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import { useTranslate } from 'i18n-calypso';
import { MutableRefObject } from 'react';
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
	title?: Element;
	author?: string;
	categories?: Category[];
	description?: string;
	shortDescription?: string;
	pricingBadge?: React.ReactNode;
	screens: NavigatorScreenObject[];
	actionButtons: React.ReactNode;
	navigatorRef: MutableRefObject< Navigator | null >;
	onClickCategory?: ( category: Category ) => void;
	onNavigatorPathChange?: ( path?: string ) => void;
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
	navigatorRef,
	onClickCategory,
	onNavigatorPathChange,
} ) => {
	const translate = useTranslate();
	const navigatorButtons = useNavigatorButtons( screens );

	const decodedDescription = useMemo(
		() => ( description ? decodeEntities( description ) : undefined ),
		[ description ]
	);

	const decodedShortDescription = useMemo(
		() => ( shortDescription ? decodeEntities( shortDescription ) : undefined ),
		[ shortDescription ]
	);

	return (
		<div className="design-preview__sidebar">
			<NavigatorScreens
				navigatorRef={ navigatorRef }
				screens={ screens }
				onNavigatorPathChange={ onNavigatorPathChange }
			>
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
						{ ( decodedDescription || decodedShortDescription ) && (
							<div className="design-preview__sidebar-description">
								<p>{ screens.length !== 1 ? decodedDescription : decodedShortDescription }</p>
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
