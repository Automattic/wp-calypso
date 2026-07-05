import './style.scss';

import { ReadList } from '@automattic/api-core';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import ExpandableSidebarMenu from 'calypso/layout/sidebar/expandable';
import ReaderSidebarListsList from './list';

interface ReaderSidebarListsProps {
	lists?: ReadList[];
	path: string;
	isOpen?: boolean;
	onClick?: () => void;
	currentListOwner?: string;
	currentListSlug?: string;
}

const ReaderSidebarLists = ( {
	lists,
	isOpen,
	onClick,
	path,
	...passedProps
}: ReaderSidebarListsProps ): JSX.Element => {
	const translate = useTranslate();

	const isChildSelected = lists?.some( ( list ) =>
		path.startsWith( `/reader/list/${ list.owner }/${ list.slug }` )
	);

	const totalUnseenCount: number =
		lists?.reduce( ( total, list ) => total + ( list.unseen_count ?? 0 ), 0 ) || 0;

	return (
		<li>
			<ExpandableSidebarMenu
				expanded={ isOpen ?? false }
				title={ translate( 'Lists' ) }
				count={ totalUnseenCount }
				compactCount
				onClick={ onClick }
				disableFlyout
				className={ clsx( {
					'sidebar__menu--selected': ! isOpen && ( isChildSelected || path === '/reader/list/new' ),
				} ) }
				expandableIconClick={ onClick }
			>
				<ReaderSidebarListsList path={ path } lists={ lists } { ...passedProps } />
			</ExpandableSidebarMenu>
		</li>
	);
};

export default ReaderSidebarLists;
