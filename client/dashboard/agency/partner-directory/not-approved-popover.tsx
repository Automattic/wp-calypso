import {
	rawUserPreferencesQuery,
	userPreferenceMutation,
	userPreferenceQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	Button,
	Popover,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useRef, useState } from 'react';
import { CardBody } from '../../components/card';
import type { UserPreferences } from '@automattic/api-core';
import type { ReactNode } from 'react';

const PREFERENCE_NAME = 'a4a-partner-directory-dashboard-not-approved-popover';

interface Props {
	children: ReactNode;
	showOnLoad: boolean;
	expertiseUrl: string;
	recordTracksEvent: ( eventName: string, properties?: Record< string, unknown > ) => void;
}

/**
 * Anchors a popover to its children nudging the agency to update its
 * expertise after a rejected application. Shown once on load until
 * dismissed, and on hover afterwards.
 */
export default function NotApprovedPopover( {
	children,
	showOnLoad,
	expertiseUrl,
	recordTracksEvent,
}: Props ) {
	const [ anchor, setAnchor ] = useState< HTMLElement | null >( null );
	const [ showPopover, setShowPopover ] = useState( false );

	const queryClient = useQueryClient();
	const { data: preferenceDismissed } = useQuery( {
		...userPreferenceQuery( PREFERENCE_NAME ),
		// The dismissal only ever changes through this popover, so avoid
		// refetching the preferences on every visit to the screen.
		staleTime: 5 * 60 * 1000,
	} );
	const { mutate: savePreference } = useMutation( userPreferenceMutation( PREFERENCE_NAME ) );

	const popoverDismissed = !! preferenceDismissed;

	useEffect( () => {
		if ( showOnLoad && preferenceDismissed === false ) {
			setShowPopover( true );
		}
	}, [ showOnLoad, preferenceDismissed ] );

	const dismissPopover = ( eventName: string ) => {
		setShowPopover( false );
		// Write through the host app's query client: the mutation's own cache
		// update targets the MSD singleton, which the classic app doesn't read.
		queryClient.setQueryData< UserPreferences >(
			rawUserPreferencesQuery().queryKey,
			( previous ) => ( {
				...previous,
				[ PREFERENCE_NAME ]: true,
			} )
		);
		savePreference( true );
		recordTracksEvent( eventName );
	};

	const handleShowPopover = ( show: boolean ) => {
		// While the on-load popover is up, only its own actions can close it.
		if ( ! showOnLoad || popoverDismissed ) {
			setShowPopover( show );
		}
	};

	// The popover renders in a portal outside the anchor, so closing waits a
	// beat to let the cursor travel from the badge into the popover.
	const closeTimer = useRef< number | undefined >( undefined );
	const openOnHover = () => {
		window.clearTimeout( closeTimer.current );
		handleShowPopover( true );
	};
	const closeOnHoverOut = () => {
		window.clearTimeout( closeTimer.current );
		closeTimer.current = window.setTimeout( () => handleShowPopover( false ), 150 );
	};
	useEffect( () => () => window.clearTimeout( closeTimer.current ), [] );

	return (
		<VStack
			as="span"
			ref={ setAnchor }
			tabIndex={ 0 }
			onMouseEnter={ openOnHover }
			onMouseLeave={ closeOnHoverOut }
			onFocus={ () => handleShowPopover( true ) }
		>
			{ children }
			{ showPopover && (
				<Popover
					anchor={ anchor }
					placement="bottom-start"
					offset={ 12 }
					shift
					focusOnMount={ false }
					onFocusOutside={ () => handleShowPopover( false ) }
				>
					<CardBody
						style={ { width: 'min(80vw, 350px)' } }
						onMouseEnter={ openOnHover }
						onMouseLeave={ closeOnHoverOut }
					>
						<VStack spacing={ 4 }>
							<Text as="p">
								{ __(
									'Your agency wasn’t approved. Please check your email for feedback from our review team.'
								) }
							</Text>
							<HStack spacing={ 3 } justify="flex-start">
								<Button
									variant="primary"
									size="compact"
									href={ expertiseUrl }
									onClick={ () =>
										dismissPopover( 'calypso_partner_directory_dashboard_update_expertise_click' )
									}
								>
									{ __( 'Update my expertise' ) }
								</Button>
								{ ! popoverDismissed && (
									<Button
										variant="secondary"
										size="compact"
										onClick={ () =>
											dismissPopover( 'calypso_partner_directory_dashboard_do_it_later_click' )
										}
									>
										{ __( 'I’ll do it later' ) }
									</Button>
								) }
							</HStack>
						</VStack>
					</CardBody>
				</Popover>
			) }
		</VStack>
	);
}
