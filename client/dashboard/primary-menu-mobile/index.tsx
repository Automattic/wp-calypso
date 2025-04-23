import { useNavigate, useRouter } from '@tanstack/react-router';
import { DropdownMenu, MenuItem } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { menu } from '@wordpress/icons';
import { useAppContext } from '../app/context';

function MobileMenuItem( {
	to,
	children,
	onClose,
}: {
	to: string;
	children: React.ReactNode;
	onClose: () => void;
} ) {
	const navigate = useNavigate();
	const router = useRouter();
	const href = router.buildLocation( {
		to,
	} ).href;
	const handleClick = ( e: React.MouseEvent ) => {
		e.preventDefault();
		navigate( { to } );
		onClose();
	};

	return (
		<MenuItem
			onClick={ handleClick }
			// @ts-expect-error -- href is supported by MenuItem, the types are not correct.
			href={ href }
		>
			{ children }
		</MenuItem>
	);
}

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
						<MobileMenuItem to="/overview" onClose={ onClose }>
							{ __( 'Overview' ) }
						</MobileMenuItem>
					) }
					{ supports.sites && (
						<MobileMenuItem to="/sites" onClose={ onClose }>
							{ __( 'Sites' ) }
						</MobileMenuItem>
					) }
					{ supports.domains && (
						<MobileMenuItem to="/domains" onClose={ onClose }>
							{ __( 'Domains' ) }
						</MobileMenuItem>
					) }
					{ supports.emails && (
						<MobileMenuItem to="/emails" onClose={ onClose }>
							{ __( 'Emails' ) }
						</MobileMenuItem>
					) }
				</>
			) }
		</DropdownMenu>
	);
}

export default PrimaryMenuMobile;
