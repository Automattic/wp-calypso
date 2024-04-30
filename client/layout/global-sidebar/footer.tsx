import { recordTracksEvent } from '@automattic/calypso-analytics';
import { LocalizeProps } from 'i18n-calypso';
import { FC } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import Gravatar from 'calypso/components/gravatar';
import QuickLanguageSwitcher from 'calypso/layout/masterbar/quick-language-switcher';
import SidebarFooter from 'calypso/layout/sidebar/footer';
import { UserData } from 'calypso/lib/user/user';
import { useSelector } from 'calypso/state';
import { isSupportSession } from 'calypso/state/support/selectors';
import { GLOBAL_SIDEBAR_EVENTS } from './events';

export const GlobalSidebarFooter: FC< {
	translate: LocalizeProps[ 'translate' ];
	user?: UserData;
} > = ( { translate, user } ) => {
	const isInSupportSession = Boolean( useSelector( isSupportSession ) );
	return (
		<SidebarFooter>
			<a
				href="/me"
				className="sidebar__footer-link sidebar__footer-profile tooltip tooltip-top"
				title={ translate( 'Profile' ) }
				data-tooltip={ translate( 'Profile' ) }
				onClick={ () => recordTracksEvent( GLOBAL_SIDEBAR_EVENTS.PROFILE_CLICK ) }
			>
				<Gravatar user={ user } size={ 20 } />
			</a>
			<AsyncLoad
				require="./menu-items/help-center/help-center"
				tooltip={ translate( 'Help' ) }
				tooltipPlacement="top"
				placeholder={
					<div className="link-help">
						<span className="help"></span>
					</div>
				}
				onClick={ () => recordTracksEvent( GLOBAL_SIDEBAR_EVENTS.HELPCENTER_CLICK ) }
			/>
			{ isInSupportSession && (
				<QuickLanguageSwitcher className="sidebar__footer-language-switcher" shouldRenderAsButton />
			) }
		</SidebarFooter>
	);
};
