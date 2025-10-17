import { useState } from 'react';
import HeaderBar from '../../components/header-bar';
import RouterLinkButton from '../../components/router-link-button';
import { useAppContext } from '../context';
import PrimaryMenu from '../primary-menu';
import SecondaryMenu from '../secondary-menu';

function Header() {
	const { Logo } = useAppContext();
	const [ isPrimaryMenuCollapsed, setPrimaryMenuCollapsed ] = useState( false );

	return (
		<HeaderBar as="header">
			{ isPrimaryMenuCollapsed && (
				<div style={ { flexShrink: 0 } }>
					<PrimaryMenu forceCollapsed />
				</div>
			) }

			{ Logo && (
				<div style={ { flexShrink: 0 } }>
					<RouterLinkButton icon={ <Logo /> } to="/" />
				</div>
			) }

			<div
				style={ {
					flexGrow: 1,
					visibility: isPrimaryMenuCollapsed ? 'hidden' : 'visible',
				} }
			>
				<PrimaryMenu onCollapseChange={ setPrimaryMenuCollapsed } />
			</div>

			<div style={ { flexShrink: 0 } }>
				<SecondaryMenu />
			</div>
		</HeaderBar>
	);
}

export default Header;
