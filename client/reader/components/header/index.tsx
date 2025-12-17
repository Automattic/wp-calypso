import { isSupportUserSession } from '@automattic/calypso-support-session';
import { __experimentalHStack as HStack, Button } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { menu } from '@wordpress/icons';
import clsx from 'clsx';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import ReaderIcon from 'calypso/assets/icons/reader/reader-icon';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { setNextLayoutFocus, activateNextLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import { getCurrentLayoutFocus } from 'calypso/state/ui/layout-focus/selectors';
import { HelpCenter } from './help-center';
import Logo from './logo';
import Notifications from './notifications';
import UserProfile from './user-profile';
import './style.scss';

const ReaderHeader = () => {
	const isDesktop = useViewportMatch( 'medium' );
	const user = useSelector( getCurrentUser );
	const dispatch = useDispatch();
	const currentLayoutFocus = useSelector( getCurrentLayoutFocus );

	const onMobileMenuClick = useCallback( () => {
		const nextLayoutFocus = currentLayoutFocus === 'sidebar' ? 'content' : 'sidebar';

		dispatch( setNextLayoutFocus( nextLayoutFocus ) );
		dispatch( activateNextLayoutFocus() );
	}, [ currentLayoutFocus, dispatch ] );

	return (
		<HStack
			className={ clsx( 'dashboard-header-bar', {
				// Only customize header for support "user" sessions because
				// "next" sessions already have a floating toolbar which acts
				// as visual indicator.
				'is-support-user-session': isSupportUserSession(),
			} ) }
			alignment="left"
			spacing={ 0 }
			justify="flex-start"
		>
			<HStack spacing={ 0 } justify="flex-start">
				{ ! isDesktop && (
					<Button
						onClick={ onMobileMenuClick }
						style={ { flexShrink: 0 } }
						icon={ menu }
						label={ __( 'Menu' ) }
					/>
				) }
				<Button
					style={ { flexShrink: 0 } }
					icon={ <Logo /> }
					label={ __( 'WordPress.com Home' ) }
					href="/v2"
				/>
			</HStack>

			<HStack spacing={ isDesktop ? 2 : 0 } justify="flex-end">
				<Button
					className={ clsx( 'dashboard-secondary-menu__item', 'is-active' ) }
					icon={ <ReaderIcon /> }
					label={ __( 'Reader' ) }
					href="/reader"
				>
					{ isDesktop ? __( 'Reader' ) : null }
				</Button>
				{ user && (
					<>
						<Notifications user={ user } className="dashboard-secondary-menu__item" />
						<HelpCenter user={ user } />
						<UserProfile user={ user } />
					</>
				) }
			</HStack>
		</HStack>
	);
};

export default ReaderHeader;
