import { Button } from '@automattic/components';
import { NavigatorScreens, useNavigatorButtons } from '@automattic/onboarding';
import { useMemo, useState } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
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
	isExternallyManaged?: boolean;
	screens: NavigatorScreenObject[];
	actionButtons: React.ReactNode;
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
	isExternallyManaged,
	screens,
	actionButtons,
	onClickCategory,
	onNavigatorPathChange,
} ) => {
	const translate = useTranslate();
	const [ isShowFullDescription, setIsShowFullDescription ] = useState( false );
	const isShowDescriptionToggle = shortDescription && description !== shortDescription;
	const navigatorButtons = useNavigatorButtons( screens, isExternallyManaged );

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
						{ ( decodedDescription || decodedShortDescription ) && (
							<div className="design-preview__sidebar-description">
								<p>
									{ isShowDescriptionToggle ? (
										<>
											{ isShowFullDescription ? decodedDescription : decodedShortDescription }
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
										decodedDescription ?? decodedShortDescription
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
