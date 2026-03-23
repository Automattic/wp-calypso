import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';
import { menu } from '@wordpress/icons';
import HeaderBar from '../../components/header-bar';
import RouterLinkButton from '../../components/router-link-button';
import { useAnalytics } from '../analytics';
import { useAppContext } from '../context';
import PrimaryMenu from '../primary-menu';
import SecondaryMenu from '../secondary-menu';

function Header( { onOpenMenu, isMenuOpen }: { onOpenMenu?: () => void; isMenuOpen?: boolean } ) {
	const isOmnibar = isEnabled( 'dashboard/omnibar' );
	const { recordTracksEvent } = useAnalytics();
	const { Logo, name } = useAppContext();
	const isDesktop = useViewportMatch( 'medium' );

	return (
		<HeaderBar as="header">
			{ isOmnibar && ! isDesktop && ! isMenuOpen && (
				<Button icon={ menu } label={ __( 'Menu' ) } onClick={ onOpenMenu } />
			) }

			{ ! isOmnibar && ! isDesktop && <PrimaryMenu /> }

			{ ! isOmnibar && Logo && (
				<div style={ { display: 'flex', alignItems: 'center' } }>
					<RouterLinkButton
						/* translators: Screen reader text for link to root of the hosting dashboard. "name" is the product of whose hosting dashboard this is: e.g. WordPress.com */
						aria-label={ sprintf( __( '%(name)s home' ), { name } ) }
						icon={ <Logo /> }
						to="/"
						onClick={ () => {
							recordTracksEvent( 'calypso_dashboard_logo_click' );
						} }
					/>
				</div>
			) }

			<div style={ { flexGrow: 1 } }>{ ! isOmnibar && isDesktop && <PrimaryMenu /> }</div>
			<div style={ { flexShrink: 0 } }>
				<SecondaryMenu />
			</div>
		</HeaderBar>
	);
}

export default Header;
