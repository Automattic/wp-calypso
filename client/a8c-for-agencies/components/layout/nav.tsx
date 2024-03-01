import { Count } from '@automattic/components';
import classNames from 'classnames';
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

type LayoutNavigationItemProps = {
	label: string;
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

export function LayoutNavigationTabs( {
	selectedText,
	selectedCount,
	items,
}: LayoutNavigationTabsProps ) {
	return (
		<NavTabs selectedText={ selectedText } selectedCount={ selectedCount }>
			{ items.map( ( { label, onClick, selected, count, path, compactCount = true } ) => (
				<NavItem
					key={ label.replace( /[^a-zA-Z0-9]/g, '' ).toLowerCase() }
					compactCount={ compactCount }
					count={ count }
					path={ path }
					onClick={ onClick }
					selected={ selected }
				>
					{ label }
				</NavItem>
			) ) }
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
		<div className="a4a-layout__navigation-wrapper">
			<SectionNav
				className={ classNames( 'a4a-layout__navigation', className ) }
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
