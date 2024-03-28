import { FoldableCard } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { SidebarNavigatorMenuItem } from 'calypso/layout/sidebar-v2/navigator/navigator-menu-item';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { Props } from './types';

import './style.scss';

/** @todo Add support for saving the open state via calypso preferences. */
const FoldableNav = ( { header, navItems, expandedInit, compact, tracksName }: Props ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const onOpen = () => {
		if ( tracksName ) {
			dispatch( recordTracksEvent( tracksName, { expanded: true } ) );
		}
	};

	const onClose = () => {
		if ( tracksName ) {
			dispatch( recordTracksEvent( tracksName, { expanded: false } ) );
		}
	};

	const hasNavItems = navItems.length > 0;
	let navContent;
	if ( hasNavItems ) {
		navContent = navItems.map( ( navItem ) => {
			return (
				<SidebarNavigatorMenuItem
					isExternalLink={ navItem.isExternalLink }
					key={ navItem.link }
					icon={ navItem.icon ?? <></> }
					path="/"
					onClickMenuItem={ () =>
						dispatch( recordTracksEvent( navItem.trackEventName, { nav_item: navItem.slug } ) )
					}
					{ ...navItem }
				/>
			);
		} );
	}

	return (
		<FoldableCard
			onOpen={ onOpen }
			onClose={ onClose }
			className="foldable-nav"
			header={ header }
			expanded={ expandedInit }
			compact={ compact }
			iconSize={ 18 }
		>
			{ hasNavItems && <ul>{ navContent }</ul> }
			{ ! hasNavItems && <p className="no-content">{ translate( 'No content found.' ) }</p> }
		</FoldableCard>
	);
};

FoldableNav.defaultProps = {
	compact: true,
	expandedInit: true,
	onOpen: () => {},
	onClose: () => {},
	tracksName: false,
};

export default FoldableNav;
