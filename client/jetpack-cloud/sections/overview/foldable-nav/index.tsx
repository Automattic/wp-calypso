import { FoldableCard } from '@automattic/components';
import './style.scss';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { SidebarNavigatorMenuItem } from 'calypso/layout/sidebar-v2/navigator/navigator-menu-item';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import { Props } from './types';

const FoldableNav = ( {
	header,
	navItems,
	expandedInit,
	compact,
	preferenceName,
	tracksName,
}: Props ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const preference = useSelector( ( state ) => getPreference( state, preferenceName ) );
	const expanded = preference?.expanded ?? expandedInit;

	const savePreferenceType = useCallback(
		( type: string, value: boolean ) => {
			dispatch(
				savePreference( preferenceName, {
					...preference,
					[ type ]: value,
				} )
			);
		},
		[ dispatch, preference, preferenceName ]
	);

	const onOpen = () => {
		savePreferenceType( 'expanded', true );
		if ( tracksName ) {
			dispatch( recordTracksEvent( tracksName + '_expanded_true' ) );
		}
	};

	const onClose = () => {
		savePreferenceType( 'expanded', false );
		if ( tracksName ) {
			dispatch( recordTracksEvent( tracksName + '_expanded_false' ) );
		}
	};

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
			onOpen={ onOpen }
			onClose={ onClose }
			className="foldable-nav"
			header={ header }
			expanded={ expanded }
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
