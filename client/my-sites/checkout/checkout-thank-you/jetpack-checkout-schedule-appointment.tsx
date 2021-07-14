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

interface Props {
	user: string;
}

const JetpackCheckoutScheduleAppointment: FunctionComponent< Props > = ( { user } ) => {
	const currentUser = useSelector( ( state ) => getCurrentUser( state ) );

	return (
		<Main fullWidthLayout className="jetpack-checkout-schedule-appointment">
			<InlineWidget
				url="https://calendly.com/d/xfg8-3ykd/jetpack-com-onboarding-call?month=2021-07"
				pageSettings={ {
					// --studio-jetpack-green
					primaryColor: '069e08',
				} }
				prefill={ { email: currentUser?.email ?? user, name: currentUser?.display_name } }
			/>
		</Main>
	);
};

export default JetpackCheckoutScheduleAppointment;
