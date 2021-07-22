/**
 * External dependencies
 */
import { InlineWidget } from 'react-calendly';
import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import getCalendlyUrl from 'calypso/lib/jetpack/get-calendly-url';
import Main from 'calypso/components/main';

/**
 * Type dependencies
 */
import type { UserData } from 'calypso/lib/user/user';

const JetpackCheckoutScheduleAppointment: FunctionComponent = () => {
	const currentUser = useSelector( ( state ) => getCurrentUser( state ) ) as UserData;
	const calendlyUrl = getCalendlyUrl();

	return (
		<Main fullWidthLayout className="jetpack-checkout-schedule-appointment">
			{ calendlyUrl ? (
				<InlineWidget
					url={ calendlyUrl }
					pageSettings={ {
						// --studio-jetpack-green
						primaryColor: '069e08',
					} }
					prefill={ { email: currentUser?.email, name: currentUser?.display_name } }
				/>
			) : (
				<div>
					{ /* This is an extreme fallback that should not be user facing, so no translation */ }
					<p>{ 'No Calendly URL set! Scheduling will not work without URL set in config.' }</p>
				</div>
			) }
		</Main>
	);
};

export default JetpackCheckoutScheduleAppointment;
