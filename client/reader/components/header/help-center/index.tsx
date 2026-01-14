import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { localizeUrl } from '@automattic/i18n-utils';
import {
	DropdownMenu,
	MenuGroup,
	MenuItem,
	__experimentalHStack as HStack,
	Icon,
	Button,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { comment, backup, page, video, rss, help } from '@wordpress/icons';
import { useState, useCallback, Suspense, lazy } from 'react';
import { useExperiment } from 'calypso/lib/explat';
import { useHelpCenter } from './use-help-center';
import type { User } from '@automattic/api-core';

const AsyncHelpCenterApp = lazy( () => import( './help-center-app' ) );

interface Props {
	user: User;
}

export function HelpCenter( { user }: Props ) {
	const { isLoading, isShown, setShowHelpCenter, setNavigateToRoute } = useHelpCenter();
	const [ helpCenterPage, setHelpCenterPage ] = useState( '' );

	const [ isLoadingExperimentAssignment, experimentAssignment ] = useExperiment(
		'calypso_help_center_menu_popover_increase_exposure'
	);
	const isMenuPanelExperimentEnabled =
		! isLoadingExperimentAssignment && experimentAssignment?.variationName === 'menu_popover';

	const trackIconInteraction = () => {
		recordTracksEvent( 'wpcom_help_center_icon_interaction', {
			is_help_center_visible: isShown,
			section: 'reader',
			is_menu_panel_enabled: isMenuPanelExperimentEnabled,
			is_assignment_loaded: ! isLoadingExperimentAssignment,
		} );
	};

	const handleToggleHelpCenter = () => {
		trackIconInteraction();
		setShowHelpCenter( ! isShown );
	};

	const handleCloseHelpCenterApp = useCallback( () => {
		setShowHelpCenter( false, undefined, true );
	}, [ setShowHelpCenter ] );

	const handleMenuClick = ( destination: string, isExternal = false ) => {
		recordTracksEvent( 'calypso_dashboard_help_center_menu_panel_click', {
			section: 'reader',
			destination,
			help_center_visible: isShown,
		} );

		if ( isExternal ) {
			return window.open( destination, '_blank', 'noopener,noreferrer' );
		}

		if ( isShown ) {
			if ( destination !== helpCenterPage ) {
				setNavigateToRoute( destination );
				setHelpCenterPage( destination );
			} else {
				setShowHelpCenter( false );
				setHelpCenterPage( '' );
				recordTracksEvent( 'calypso_inlinehelp_close', {
					force_site_id: true,
					location: 'help-center',
					section: 'reader',
				} );
			}
		} else {
			setNavigateToRoute( destination );
			setHelpCenterPage( destination );
			setShowHelpCenter( true );

			recordTracksEvent( 'calypso_inlinehelp_show', {
				force_site_id: true,
				location: 'help-center',
				section: 'reader',
				destination,
			} );
		}
	};

	if ( isMenuPanelExperimentEnabled ) {
		return (
			<>
				<DropdownMenu
					popoverProps={ {
						placement: 'bottom-end',
						offset: 8,
					} }
					label={ __( 'Help' ) }
					icon={ help }
					toggleProps={ {
						className: 'dashboard-secondary-menu__item',
						variant: 'tertiary',
					} }
					onToggle={ trackIconInteraction }
				>
					{ ( { onClose } ) => (
						<>
							<MenuGroup>
								<MenuItem
									onClick={ () => {
										handleMenuClick( '/odie' );
										onClose();
									} }
								>
									<HStack spacing={ 2 } justify="left">
										<Icon icon={ comment } size={ 24 } />
										<span>{ __( 'Chat support' ) }</span>
									</HStack>
								</MenuItem>
								<MenuItem
									onClick={ () => {
										handleMenuClick( '/chat-history' );
										onClose();
									} }
								>
									<HStack spacing={ 2 } justify="left">
										<Icon icon={ backup } size={ 24 } />
										<span>{ __( 'Chat history' ) }</span>
									</HStack>
								</MenuItem>
							</MenuGroup>
							<MenuGroup>
								<MenuItem
									onClick={ () => {
										handleMenuClick( '/support-guides' );
										onClose();
									} }
								>
									<HStack spacing={ 2 } justify="left">
										<Icon icon={ page } size={ 24 } />
										<span>{ __( 'Support guides' ) }</span>
									</HStack>
								</MenuItem>
								<MenuItem
									onClick={ () => {
										handleMenuClick(
											localizeUrl( 'https://wordpress.com/support/courses/' ),
											true
										);
										onClose();
									} }
								>
									<HStack spacing={ 2 } justify="left">
										<Icon icon={ video } size={ 24 } />
										<span>{ __( 'Courses' ) }</span>
									</HStack>
								</MenuItem>
								<MenuItem
									onClick={ () => {
										handleMenuClick(
											localizeUrl( 'https://wordpress.com/blog/category/product-features/' ),
											true
										);
										onClose();
									} }
								>
									<HStack spacing={ 2 } justify="left">
										<Icon icon={ rss } size={ 24 } />
										<span>{ __( 'Product updates' ) }</span>
									</HStack>
								</MenuItem>
							</MenuGroup>
						</>
					) }
				</DropdownMenu>
				<Suspense fallback={ null }>
					{ isShown && (
						<AsyncHelpCenterApp
							currentUser={ user }
							handleClose={ handleCloseHelpCenterApp }
							locale={ user.language }
							onboardingUrl={ config( 'wpcom_signup_url' ) }
							sectionName="reader"
						/>
					) }
				</Suspense>
			</>
		);
	}

	return (
		<>
			<Button
				className="dashboard-secondary-menu__item"
				label={ __( 'Help' ) }
				icon={ help }
				variant="tertiary"
				isBusy={ isLoading }
				onClick={ handleToggleHelpCenter }
			/>
			{ isShown && (
				<Suspense fallback={ null }>
					<AsyncHelpCenterApp
						currentUser={ user }
						handleClose={ handleCloseHelpCenterApp }
						locale={ user.language }
						onboardingUrl={ config( 'wpcom_signup_url' ) }
						sectionName="reader"
					/>
				</Suspense>
			) }
		</>
	);
}
