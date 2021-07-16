/**
 * External dependencies
 */
import { InlineWidget } from 'react-calendly';
import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import Main from 'calypso/components/main';
import { getCurrentUser } from 'calypso/state/current-user/selectors';

/**
 * Type dependencies
 */
import type { UserData } from 'calypso/lib/user/user';

const JetpackCheckoutScheduleAppointment: FunctionComponent = () => {
	const currentUser = useSelector( ( state ) => getCurrentUser( state ) ) as UserData;

	return (
		<Main fullWidthLayout className="jetpack-checkout-schedule-appointment">
			<InlineWidget
				url="https://calendly.com/d/xfg8-3ykd/jetpack-com-onboarding-call"
				pageSettings={ {
					// --studio-jetpack-green
					primaryColor: '069e08',
				} }
				prefill={ { email: currentUser?.email, name: currentUser?.display_name } }
			/>
		</Main>
	);
};

export default JetpackCheckoutScheduleAppointment;
