import { __experimentalHStack as HStack, DropdownMenu } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { menu } from '@wordpress/icons';
import Menu from '../../components/menu';
import RouterLinkMenuItem from '../../components/router-link-menu-item';
import { useAppContext } from '../context';

function PrimaryMenuMobile() {
	const { supports } = useAppContext();

	return (
		<DropdownMenu
			icon={ menu }
			label={ __( 'Main Menu' ) }
			popoverProps={ {
				placement: 'bottom-end',
			} }
		>
			{ ( { onClose } ) => (
				<>
					{ supports.overview && (
						<RouterLinkMenuItem to="/overview" onClick={ onClose }>
							{ __( 'Overview' ) }
						</RouterLinkMenuItem>
					) }
					{ supports.sites && (
						<RouterLinkMenuItem to="/sites" onClick={ onClose }>
							{ __( 'Sites' ) }
						</RouterLinkMenuItem>
					) }
					{ supports.domains && (
						<RouterLinkMenuItem to="/domains" onClick={ onClose }>
							{ __( 'Domains' ) }
						</RouterLinkMenuItem>
					) }
					{ supports.emails && (
						<RouterLinkMenuItem to="/emails" onClick={ onClose }>
							{ __( 'Emails' ) }
						</RouterLinkMenuItem>
					) }
					{ supports.plugins && (
						<RouterLinkMenuItem to="/plugins" onClick={ onClose }>
							{ __( 'Plugins' ) }
						</RouterLinkMenuItem>
					) }
					{ supports.themes && (
						<Menu.ItemLink
							href="/themes"
							onClick={ onClose }
							target="_blank"
							rel="noopener noreferrer"
						>
							<HStack justify="flex-start" spacing={ 1 }>
								<span>{ __( 'Themes' ) }</span>
								<span aria-label={ __( '(opens in a new tab)' ) }>&#8599;</span>
							</HStack>
						</Menu.ItemLink>
					) }
				</>
			) }
		</DropdownMenu>
	);
}

export default PrimaryMenuMobile;
