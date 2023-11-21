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

export function LayoutNavigationItem( {
	label,
	onClick,
	path,
	count,
	selected,
	compactCount = true,
}: LayoutNavigationItemProps ) {
	return (
		<NavItem
			compactCount={ compactCount }
			count={ count }
			path={ path }
			onClick={ onClick }
			selected={ selected }
		>
			{ label }
		</NavItem>
	);
}

export default function LayoutNavigation( {
	className,
	children,
	selectedText,
	selectedCount,
}: LayoutNavigationProps ) {
	return (
		<SectionNav
			className={ classNames( 'jetpack-cloud-layout__navigation', className ) }
			applyUpdatedStyles
			selectedText={
				<span>
					{ selectedText }
					{ selectedCount !== undefined && <Count count={ selectedCount } compact={ true } /> }
				</span>
			}
		>
			<NavTabs selectedText={ selectedText } selectedCount={ selectedCount }>
				{ children }
			</NavTabs>
		</SectionNav>
	);
}
