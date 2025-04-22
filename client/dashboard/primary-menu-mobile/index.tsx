import { DropdownMenu, MenuItem } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { menu } from '@wordpress/icons';
import { useAppContext } from '../app/context';

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
						// @ts-expect-error -- href is supported by MenuItem, the types are not correct.
						<MenuItem href="overview" onClick={ onClose }>
							{ __( 'Overview' ) }
						</MenuItem>
					) }
					{ supports.sites && (
						// @ts-expect-error -- href is supported by MenuItem, the types are not correct.
						<MenuItem href="sites" onClick={ onClose }>
							{ __( 'Sites' ) }
						</MenuItem>
					) }
					{ supports.domains && (
						// @ts-expect-error -- href is supported by MenuItem, the types are not correct.
						<MenuItem href="domains" onClick={ onClose }>
							{ __( 'Domains' ) }
						</MenuItem>
					) }
					{ supports.emails && (
						// @ts-expect-error -- href is supported by MenuItem, the types are not correct.
						<MenuItem href="emails" onClick={ onClose }>
							{ __( 'Emails' ) }
						</MenuItem>
					) }
				</>
			) }
		</DropdownMenu>
	);
}

export default PrimaryMenuMobile;
