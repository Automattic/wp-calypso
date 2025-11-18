import { useViewportMatch } from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';
import HeaderBar from '../../components/header-bar';
import RouterLinkButton from '../../components/router-link-button';
import { useAppContext } from '../context';
import PrimaryMenu from '../primary-menu';
import SecondaryMenu from '../secondary-menu';

function Header() {
	const { Logo, name } = useAppContext();
	const isDesktop = useViewportMatch( 'medium' );

	return (
		<HeaderBar as="header">
			{ ! isDesktop && <PrimaryMenu /> }

			{ Logo && (
				<div style={ { display: 'flex', alignItems: 'center' } }>
					<RouterLinkButton
						/* translators: Screen reader text for link to root of the hosting dashboard. "name" is the product of whose hosting dashboard this is: e.g. WordPress.com */
						aria-label={ sprintf( __( '%(name)s home' ), { name } ) }
						icon={ <Logo /> }
						to="/"
					/>
				</div>
			) }

			<div style={ { flexGrow: 1 } }>{ isDesktop && <PrimaryMenu /> }</div>
			<div style={ { flexShrink: 0 } }>
				<SecondaryMenu />
			</div>
		</HeaderBar>
	);
}

export default Header;
