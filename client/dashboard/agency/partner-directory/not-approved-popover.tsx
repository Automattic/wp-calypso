import {
	Popover,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useRef, useState } from 'react';
import { CardBody } from '../../components/card';
import LinkButton from './link-button';
import type { ReactNode } from 'react';

interface NotApprovedPopoverProps {
	children: ReactNode;
	expertiseUrl: string;
	recordTracksEvent: ( eventName: string, properties?: Record< string, unknown > ) => void;
	shouldUseRouterLink?: boolean;
}

/**
 * Anchors a popover to its children, shown on hover or focus, nudging the
 * agency to update its expertise after a rejected application.
 */
export default function NotApprovedPopover( {
	children,
	expertiseUrl,
	recordTracksEvent,
	shouldUseRouterLink,
}: NotApprovedPopoverProps ) {
	const [ anchor, setAnchor ] = useState< HTMLElement | null >( null );
	const [ showPopover, setShowPopover ] = useState( false );

	// The popover renders in a portal outside the anchor, so closing waits a
	// beat to let the cursor travel from the badge into the popover.
	const closeTimer = useRef< number | undefined >( undefined );
	const openOnHover = () => {
		window.clearTimeout( closeTimer.current );
		setShowPopover( true );
	};
	const closeOnHoverOut = () => {
		window.clearTimeout( closeTimer.current );
		closeTimer.current = window.setTimeout( () => setShowPopover( false ), 150 );
	};
	useEffect( () => () => window.clearTimeout( closeTimer.current ), [] );

	return (
		<VStack
			as="span"
			ref={ setAnchor }
			tabIndex={ 0 }
			onMouseEnter={ openOnHover }
			onMouseLeave={ closeOnHoverOut }
			onFocus={ openOnHover }
			onBlur={ closeOnHoverOut }
			onKeyDown={ ( event: React.KeyboardEvent ) => {
				if ( event.key === 'Escape' ) {
					setShowPopover( false );
				}
			} }
		>
			{ children }
			{ showPopover && (
				<Popover
					anchor={ anchor }
					placement="bottom-start"
					offset={ 12 }
					shift
					focusOnMount={ false }
					onFocusOutside={ () => setShowPopover( false ) }
					onClose={ () => setShowPopover( false ) }
				>
					<CardBody
						style={ { width: 'min(80vw, 350px)' } }
						onMouseEnter={ openOnHover }
						onMouseLeave={ closeOnHoverOut }
						onFocus={ openOnHover }
						onBlur={ closeOnHoverOut }
					>
						<VStack spacing={ 4 }>
							<Text as="p">
								{ __(
									'Your agency wasn’t approved. Please check your email for feedback from our review team.'
								) }
							</Text>
							<HStack spacing={ 3 } justify="flex-start">
								<LinkButton
									variant="primary"
									size="compact"
									href={ expertiseUrl }
									onClick={ () =>
										recordTracksEvent(
											'calypso_a4a_partner_directory_dashboard_update_expertise_click'
										)
									}
									shouldUseRouterLink={ shouldUseRouterLink }
								>
									{ __( 'Update my expertise' ) }
								</LinkButton>
							</HStack>
						</VStack>
					</CardBody>
				</Popover>
			) }
		</VStack>
	);
}
