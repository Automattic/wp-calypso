import { Count } from '@automattic/components';
import clsx from 'clsx';
import { ReactNode } from 'react';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';

type LayoutNavigationProps = {
	className?: string;
	children: ReactNode;
	selectedText: string;
	selectedCount?: number;
};

export type LayoutNavigationItemProps = {
	key?: string;
	label: string;
	icon?: ReactNode;
	compactCount?: boolean;
	onClick?: () => void;
	path?: string;
	count?: number;
	selected?: boolean;
};

type LayoutNavigationTabsProps = {
	selectedText: string;
	selectedCount?: number;
	items: LayoutNavigationItemProps[];
};

export const buildNavItems = ( {
	items,
	selectedKey,
	onItemClick,
	basePath,
}: {
	items: LayoutNavigationItemProps[];
	selectedKey: string;
	onItemClick?: () => void;
	basePath?: string;
} ): LayoutNavigationItemProps[] =>
	items.map( ( navItem ) => ( {
		...navItem,
		selected: selectedKey === navItem.key,
		path: `${ basePath }/${ navItem.key }`,
		onClick: onItemClick,
	} ) );

export function LayoutNavigationTabs( {
	selectedText,
	selectedCount,
	items,
}: LayoutNavigationTabsProps ) {
	return (
		<NavTabs selectedText={ selectedText } selectedCount={ selectedCount }>
			{ items.map(
				( { key, icon, label, onClick, selected, count, path, compactCount = true } ) => (
					<NavItem
						key={ key ?? label.replace( /[^a-zA-Z0-9]/g, '' ).toLowerCase() }
						compactCount={ compactCount }
						count={ count }
						path={ path }
						onClick={ onClick }
						selected={ selected }
					>
						<div className="content">
							{ icon }
							{ label }
						</div>
					</NavItem>
				)
			) }
		</NavTabs>
	);
}

export default function LayoutNavigation( {
	className,
	selectedText,
	selectedCount,
	children,
}: LayoutNavigationProps ) {
	return (
		<div className="hosting-dashboard-layout__navigation-wrapper">
			<SectionNav
				className={ clsx( 'hosting-dashboard-layout__navigation', className ) }
				applyUpdatedStyles
				selectedText={
					<span>
						{ selectedText }
						{ Number.isInteger( selectedCount ) && <Count count={ selectedCount } compact /> }
					</span>
				}
				selectedCount={ selectedCount }
			>
				{ children }
			</SectionNav>
		</div>
	);
}
