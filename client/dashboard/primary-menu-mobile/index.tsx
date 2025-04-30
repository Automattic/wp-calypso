import { DropdownMenu } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { menu } from '@wordpress/icons';
import { useAppContext } from '../app/context';
import RouterLinkMenuItem from '../router-link-menu-item';

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
				</>
			) }
		</DropdownMenu>
	);
}

export default PrimaryMenuMobile;
