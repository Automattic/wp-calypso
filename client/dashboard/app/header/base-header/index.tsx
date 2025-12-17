import { User } from '@automattic/api-core';
import { useViewportMatch } from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';
import { FC } from 'react';
import HeaderBar from '../../../components/header-bar';
import RouterLinkButton from '../../../components/router-link-button';
import { AppConfigSupports } from '../../context';
import PrimaryMenu from '../../primary-menu';
import SecondaryMenu from '../../secondary-menu';

interface BaseHeaderProps {
	appName: string;
	hidePrimaryMenu?: boolean;
	Logo: FC | null;
	supports: AppConfigSupports;
	user: User;
	logout: () => Promise< void >;
	navigateTo: ( path: string ) => void;
	recordTracksEvent: ( eventName: string, args?: Record< string, unknown > ) => void;
}

/**
 * Header which is compatible with both Multi Site Dashboard (v2) and Reader.
 *
 * - Avoid using hooks from TanStack Router.
 * - Avoid using hooks that are specific to Multi Site Dashboard (v2).
 *
 * Use props to pass the necessary data and handlers.
 */
function BaseHeader( props: BaseHeaderProps ): JSX.Element {
	const { appName, hidePrimaryMenu, Logo, recordTracksEvent, supports } = props;
	const isDesktop = useViewportMatch( 'medium' );

	return (
		<HeaderBar as="header">
			{ ! isDesktop && ! hidePrimaryMenu && <PrimaryMenu /> }

			{ Logo && (
				<div style={ { display: 'flex', alignItems: 'center' } }>
					<RouterLinkButton
						/* translators: Screen reader text for link to root of the hosting dashboard. "name" is the product of whose hosting dashboard this is: e.g. WordPress.com */
						aria-label={ sprintf( __( '%(name)s home' ), { name: appName } ) }
						icon={ <Logo /> }
						to="/"
						onClick={ () => {
							recordTracksEvent( 'calypso_dashboard_logo_click' );
						} }
					/>
				</div>
			) }

			<div style={ { flexGrow: 1 } }>{ isDesktop && ! hidePrimaryMenu && <PrimaryMenu /> }</div>
			<div style={ { flexShrink: 0 } }>
				<SecondaryMenu
					supports={ supports }
					user={ props.user }
					navigateTo={ props.navigateTo }
					logout={ props.logout }
					recordTracksEvent={ recordTracksEvent }
				/>
			</div>
		</HeaderBar>
	);
}

export default BaseHeader;
