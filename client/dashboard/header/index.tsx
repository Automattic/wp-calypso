import { useNavigate, useRouter } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { useAppContext } from '../app/context';
import HeaderBar from '../header-bar';
import PrimaryMenu from '../primary-menu';
import PrimaryMenuMobile from '../primary-menu-mobile';
import SecondaryMenu from '../secondary-menu';

function Header() {
	const { Logo } = useAppContext();
	const isDesktop = useViewportMatch( 'medium' );
	const navigate = useNavigate();
	const router = useRouter();
	const href = router.buildLocation( { to: '/' } ).href;

	return (
		<HeaderBar as="header">
			{ ! isDesktop && (
				<div>
					<PrimaryMenuMobile />
				</div>
			) }

			{ Logo && (
				<div style={ { display: 'flex', alignItems: 'center' } }>
					<Button
						icon={ <Logo /> }
						href={ href }
						onClick={ ( event: React.MouseEvent ) => {
							event.preventDefault();
							navigate( { to: '/' } );
						} }
					/>
				</div>
			) }

			<div style={ { flexGrow: 1 } }>{ isDesktop && <PrimaryMenu /> }</div>

			<div>
				<SecondaryMenu />
			</div>
		</HeaderBar>
	);
}

export default Header;
