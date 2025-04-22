import { useNavigate, useRouter } from '@tanstack/react-router';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
	Dropdown,
	MenuGroup,
	MenuItem,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { help, bellUnread, bell, commentAuthorAvatar } from '@wordpress/icons';
import { useAppContext } from '../app/context';
import { useAuth } from '../auth';
import { useOpenCommandPalette } from '../command-palette/utils';
import MenuDivider from '../menu-divider';
import './style.scss';

interface ReaderIconProps {
	className?: string;
	height?: number;
	viewBox?: string;
	width?: number;
}

function ReaderIcon( props: ReaderIconProps ): JSX.Element {
	const { className, height = 11, viewBox = '0 0 24 11', width = 24 } = props;

	return (
		<svg
			className={ className }
			width={ width }
			height={ height }
			viewBox={ viewBox }
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path d="M22.8746 4.60676L22.8197 4.3575C22.3347 2.17436 20.276 0.584279 17.9245 0.584279C16.6527 0.584279 15.4358 1.03122 14.5116 1.84775C14.1914 2.13139 13.9443 2.44081 13.743 2.74163C13.1849 2.63849 12.6085 2.56114 12.032 2.56114H12.0046C11.419 2.56114 10.8425 2.64709 10.2753 2.75023C10.0648 2.44081 9.82691 2.13139 9.49752 1.83915C8.57338 1.01403 7.35646 0.575684 6.08463 0.575684C3.72398 0.584279 1.66527 2.17436 1.18033 4.3575L1.12543 4.60676H0V6.00775H1.12543L1.18033 6.257C1.63782 8.44014 3.69653 10.0302 6.07548 10.0302C8.83873 10.0302 11.0804 7.91585 11.0804 5.31155C11.0804 5.31155 11.0896 4.72709 10.8517 3.97072C11.236 3.91915 11.6203 3.87618 12.0046 3.87618C12.3706 3.87618 12.7549 3.91056 13.1483 3.96213C12.9012 4.72709 12.9195 5.31155 12.9195 5.31155C12.9195 7.91585 15.1613 10.0302 17.9245 10.0302C20.3035 10.0302 22.3622 8.44874 22.8197 6.257L22.8746 6.00775H24V4.60676H22.8746ZM6.07548 8.62923C4.13572 8.62923 2.5528 7.14229 2.5528 5.30295C2.5528 3.46362 4.13572 1.97667 6.07548 1.97667C8.01524 1.97667 9.59816 3.46362 9.59816 5.30295C9.59816 7.14229 8.01524 8.62923 6.07548 8.62923ZM17.9245 8.62923C15.9847 8.62923 14.4018 7.14229 14.4018 5.30295C14.4018 3.46362 15.9847 1.97667 17.9245 1.97667C19.8643 1.97667 21.4472 3.46362 21.4472 5.30295C21.4472 7.14229 19.8643 8.62923 17.9245 8.62923Z" />
		</svg>
	);
}

function NavMenuItem( { to, children }: { to: string; children: React.ReactNode } ) {
	const navigate = useNavigate();
	const router = useRouter();
	const href = router.buildLocation( {
		to,
	} ).href;
	return (
		<MenuItem
			// @ts-expect-error -- The MenuItem component types are not correct, href is a valid prop.
			href={ href }
			onClick={ ( e ) => {
				e.preventDefault();
				navigate( { to } );
			} }
			__next40pxDefaultSize
		>
			{ children }
		</MenuItem>
	);
}

// User profile dropdown component
function UserProfile() {
	const { user } = useAuth();
	const { supports } = useAppContext();
	const openCommandPalette = useOpenCommandPalette();

	return (
		<Dropdown
			popoverProps={ {
				placement: 'bottom-end',
				offset: 8,
			} }
			renderToggle={ ( { isOpen, onToggle } ) => (
				<Button
					className="dashboard-secondary-menu__item"
					onClick={ onToggle }
					aria-expanded={ isOpen }
					variant="tertiary"
					label={ __( 'My profile' ) }
					icon={
						user.avatar_URL ? (
							<img
								className="dashboard-secondary-menu__avatar"
								src={ user.avatar_URL }
								alt={ __( 'User avatar' ) }
							/>
						) : (
							commentAuthorAvatar
						)
					}
				/>
			) }
			renderContent={ ( { onClose } ) => (
				<VStack>
					<VStack style={ { padding: '16px', borderBottom: '1px solid #ccc' } } spacing={ 1 }>
						<Text>{ user.display_name }</Text>
						<Text variant="muted">@{ user.username }</Text>
					</VStack>
					<MenuGroup>
						<NavMenuItem to="/me/profile">{ __( 'Profile' ) }</NavMenuItem>
						<NavMenuItem to="/me/billing">{ __( 'Billing' ) }</NavMenuItem>
						<NavMenuItem to="/me/security">{ __( 'Security' ) }</NavMenuItem>
						<NavMenuItem to="/me/privacy">{ __( 'Privacy' ) }</NavMenuItem>
						{ supports.notifications && (
							<NavMenuItem to="/me/notifications">{ __( 'Notifications' ) }</NavMenuItem>
						) }
					</MenuGroup>
					<MenuGroup>
						<MenuItem
							onClick={ () => {
								// First close the dropdown
								onClose();
								// Then open the command palette after a tiny delay
								// to ensure the dropdown is fully closed
								requestAnimationFrame( () => {
									openCommandPalette();
								} );
							} }
							shortcut="⌘K"
						>
							{ __( 'Command Palette' ) }
						</MenuItem>
						<MenuItem onClick={ () => {} }>{ __( 'Theme' ) }</MenuItem>
					</MenuGroup>
					<MenuGroup>
						<MenuItem onClick={ () => {} }>{ __( 'Log out' ) }</MenuItem>
					</MenuGroup>
				</VStack>
			) }
		/>
	);
}

function SecondaryMenu() {
	const navigate = useNavigate();
	const { supports } = useAppContext();
	const hasUnreadNotifications = false;
	const notificationsPath = '/me/notifications';

	const openHelpCenter = () => {
		// Open help center action would go here
	};

	return (
		<HStack spacing={ 3 } justify="flex-end">
			{ supports.reader && (
				<>
					<Button
						className="dashboard-secondary-menu__item"
						icon={ <ReaderIcon /> }
						label={ __( 'Reader' ) }
						text={ __( 'Reader' ) }
						href="/reader"
					/>
					<MenuDivider />
				</>
			) }
			{ supports.help && (
				<Button
					className="dashboard-secondary-menu__item"
					label={ __( 'Help' ) }
					onClick={ openHelpCenter }
					icon={ help }
					variant="tertiary"
				/>
			) }
			{ supports.notifications && (
				<Button
					className="dashboard-secondary-menu__item"
					label={ __( 'Notifications' ) }
					icon={ hasUnreadNotifications ? bellUnread : bell }
					variant="tertiary"
					onClick={ ( e: React.MouseEvent< HTMLButtonElement > ) => {
						e.preventDefault();
						navigate( { to: notificationsPath } );
					} }
					href={ notificationsPath }
				/>
			) }
			<UserProfile />
		</HStack>
	);
}

export default SecondaryMenu;
