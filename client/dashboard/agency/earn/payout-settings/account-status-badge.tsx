import { Button, Popover, __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { info } from '@wordpress/icons';
import { Badge } from '@wordpress/ui';
import { useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { Text } from '../../../components/text';
import type { getAccountStatus } from './get-account-status';

import './style.scss';

// The reason opens on click, not hover, so it also works on touch screens.
export default function AccountStatusBadge( {
	accountStatus,
	source,
}: {
	accountStatus: NonNullable< ReturnType< typeof getAccountStatus > >;
	source: 'referrals_empty_state' | 'payout_settings';
} ) {
	const { recordTracksEvent } = useAnalytics();
	const [ isReasonOpen, setIsReasonOpen ] = useState( false );
	// Anchored to the button: without an anchor, Popover leaves a placeholder in the row,
	// and the row's gap makes the header shift when it opens.
	const [ reasonButton, setReasonButton ] = useState< HTMLButtonElement | null >( null );

	return (
		<HStack as="span" spacing={ 1 } justify="flex-start" expanded={ false }>
			<Badge intent={ accountStatus.badgeIntent }>{ accountStatus.status }</Badge>
			{ accountStatus.statusReason && (
				<Button
					ref={ setReasonButton }
					size="small"
					icon={ info }
					iconSize={ 16 }
					label={ __( 'Why this payment status?' ) }
					aria-expanded={ isReasonOpen }
					onClick={ () => {
						if ( ! isReasonOpen ) {
							recordTracksEvent( 'calypso_a4a_payout_status_reason_open', {
								source,
								status: accountStatus.status,
							} );
						}
						setIsReasonOpen( ! isReasonOpen );
					} }
				/>
			) }
			{ isReasonOpen && accountStatus.statusReason && (
				<Popover
					anchor={ reasonButton }
					offset={ 12 }
					placement="bottom-start"
					focusOnMount
					onClose={ () => setIsReasonOpen( false ) }
				>
					<Text as="p" className="earn-payout-settings-status-reason">
						{ accountStatus.statusReason }
					</Text>
				</Popover>
			) }
		</HStack>
	);
}
