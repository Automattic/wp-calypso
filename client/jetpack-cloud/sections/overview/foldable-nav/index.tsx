import FoldableCard from '@automattic/components/src/foldable-card';
import './style.scss';
import { useTranslate } from 'i18n-calypso';
import { SidebarNavigatorMenuItem } from 'calypso/layout/sidebar-v2/navigator/navigator-menu-item';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { Props } from './types';

const FoldableNav = ( { header, navItems }: Props ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const hasNavItems = navItems.length > 0;
	let navContent;
	if ( hasNavItems ) {
		navContent = navItems.map( ( navItem ) => {
			return (
				<SidebarNavigatorMenuItem
					key={ navItem.link }
					icon={ navItem.icon ?? <></> }
					path="/"
					onClickMenuItem={ () =>
						dispatch( recordTracksEvent( navItem.trackEventName, { nav_item: navItem.title } ) )
					}
					{ ...navItem }
				/>
			);
		} );
	}
	return (
		<FoldableCard
			className="foldable-nav"
			header={ header }
			expanded={ true }
			compact={ true }
			iconSize={ 18 }
		>
			{ hasNavItems && <ul>{ navContent }</ul> }
			{ ! hasNavItems && <p className="no-content">{ translate( 'No content found.' ) }</p> }
		</FoldableCard>
	);
};

export default FoldableNav;
