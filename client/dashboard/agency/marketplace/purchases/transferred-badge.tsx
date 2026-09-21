import {
	ExternalLink,
	Popover,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import { useEffect, useRef, useState } from 'react';
import { CardBody } from '../../../components/card';
import { formatDate, parseDateAsUTC } from '../../../utils/datetime';

const BILLING_GUIDE_URL =
	'https://agencieshelp.automattic.com/knowledge-base/moving-existing-wordpress-com-plans-into-the-automattic-for-agencies-billing-system/';

interface Props {
	billedFrom: string;
	locale: string;
}

export default function TransferredBadge( { billedFrom, locale }: Props ) {
	const [ anchor, setAnchor ] = useState< HTMLElement | null >( null );
	const [ isOpen, setIsOpen ] = useState( false );

	// The popover renders in a portal outside the anchor, so closing waits a
	// beat to let the cursor travel from the badge into the popover.
	const closeTimer = useRef< number | undefined >( undefined );
	const open = () => {
		window.clearTimeout( closeTimer.current );
		setIsOpen( true );
	};
	const closeSoon = () => {
		window.clearTimeout( closeTimer.current );
		closeTimer.current = window.setTimeout( () => setIsOpen( false ), 150 );
	};
	useEffect( () => () => window.clearTimeout( closeTimer.current ), [] );

	return (
		<VStack
			as="span"
			ref={ setAnchor }
			tabIndex={ 0 }
			onMouseEnter={ open }
			onMouseLeave={ closeSoon }
			onFocus={ open }
			onBlur={ closeSoon }
			onKeyDown={ ( event: React.KeyboardEvent ) => {
				if ( event.key === 'Escape' ) {
					setIsOpen( false );
				}
			} }
		>
			<Badge>{ __( 'Transferred' ) }</Badge>
			{ isOpen && (
				<Popover
					anchor={ anchor }
					placement="bottom-start"
					offset={ 12 }
					shift
					focusOnMount={ false }
					onFocusOutside={ () => setIsOpen( false ) }
					onClose={ () => setIsOpen( false ) }
				>
					<CardBody
						style={ { width: 'min(80vw, 350px)' } }
						onMouseEnter={ open }
						onMouseLeave={ closeSoon }
						onFocus={ open }
						onBlur={ closeSoon }
					>
						<Text as="p">
							{ createInterpolateElement(
								__(
									'Your plan is now with Automattic for Agencies. You won’t be billed until <date />.'
								),
								{ date: <strong>{ formatDate( parseDateAsUTC( billedFrom ), locale ) }</strong> }
							) }
						</Text>
						<ExternalLink href={ BILLING_GUIDE_URL }>
							{ __( 'Learn about billing for transferred sites' ) }
						</ExternalLink>
					</CardBody>
				</Popover>
			) }
		</VStack>
	);
}
