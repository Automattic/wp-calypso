import { Button, Spinner } from '@automattic/components';
import styled from '@emotion/styled';
import { Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';

// Disabling this to keep visual ordering: function first, styled components below.
/* eslint-disable @typescript-eslint/no-use-before-define */

// Stripe gives the customer 60 seconds to approve a BLIK payment in their
// banking app after the PaymentIntent enters `requires_action`. The customer
// also has a 2-minute window from the moment the BLIK code is generated, but
// once the code is submitted the 60-second clock is the binding limit.
const BLIK_AUTHORIZATION_TIMEOUT_SECONDS = 60;

export function BlikConfirmation( {
	formattedTotal,
	cancel,
}: {
	formattedTotal: string;
	cancel: () => void;
} ) {
	const translate = useTranslate();
	const secondsRemaining = useCountdown( BLIK_AUTHORIZATION_TIMEOUT_SECONDS );
	const isExpired = secondsRemaining <= 0;

	return (
		<Modal
			title={ translate( 'Confirm your BLIK payment' ) as string }
			className="blik-confirmation"
			onRequestClose={ cancel }
			shouldCloseOnClickOutside={ false }
			isDismissible
		>
			<BlikModalBody>
				{ ! isExpired && <Spinner size={ 32 } /> }

				{ /*
				 * Live region announces only state transitions (waiting → expired) so
				 * screen reader users aren't bombarded by per-second countdown updates.
				 * The visible countdown below is presentational.
				 */ }
				<BlikModalHeading aria-live="polite" aria-atomic="true">
					{ isExpired
						? translate( 'BLIK code expired' )
						: translate( 'Open your banking app to approve' ) }
				</BlikModalHeading>

				{ ! isExpired ? (
					<BlikModalText>
						{ translate(
							'Confirm the payment of %(amount)s in your banking app within {{strong}}%(seconds)s seconds{{/strong}}.',
							{
								args: {
									amount: formattedTotal,
									seconds: secondsRemaining,
								},
								components: {
									strong: <strong />,
								},
							}
						) }
					</BlikModalText>
				) : (
					<BlikModalText>
						{ translate(
							'The 60-second authorization window has passed. Generate a new BLIK code in your banking app and try again.'
						) }
					</BlikModalText>
				) }
			</BlikModalBody>

			<BlikModalFooter>
				<Button borderless onClick={ cancel }>
					{ translate( 'Cancel payment' ) }
				</Button>
			</BlikModalFooter>
		</Modal>
	);
}

function useCountdown( initialSeconds: number ) {
	const [ secondsRemaining, setSecondsRemaining ] = useState( initialSeconds );

	useEffect( () => {
		const tick = setInterval( () => {
			setSecondsRemaining( ( s ) => {
				if ( s <= 0 ) {
					clearInterval( tick );
					return 0;
				}
				return s - 1;
			} );
		}, 1000 );
		return () => clearInterval( tick );
	}, [] );

	return secondsRemaining;
}

const BlikModalBody = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
	padding: 16px 0;
	gap: 12px;
	min-height: 140px;
`;

const BlikModalHeading = styled.h2`
	font-size: 16px;
	font-weight: 600;
	margin: 0;
`;

const BlikModalText = styled.p`
	font-size: 14px;
	color: var( --color-text-subtle );
	margin: 0;
	max-width: 360px;
`;

const BlikModalFooter = styled.div`
	display: flex;
	justify-content: center;
	margin-top: 16px;
`;
