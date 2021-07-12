/**
 * External dependencies
 */
import { InlineWidget } from 'react-calendly';
import React, { FunctionComponent } from 'react';
import { Card } from '@automattic/components';

/**
 * Internal dependencies
 */
import Main from 'calypso/components/main';

interface Props {
	user: string;
}

const JetpackCheckoutScheduleAppointment: FunctionComponent< Props > = ( { user } ) => {
	return (
		<Main fullWidthLayout className="jetpack-checkout-schedule-appointment">
			<Card className="jetpack-checkout-schedule-appointment__card">
				<InlineWidget
					url="https://calendly.com/caleb-bauermeister-dev"
					pageSettings={ {
						backgroundColor: 'ffffff',
						hideEventTypeDetails: false,
						hideLandingPageDetails: false,
						primaryColor: '00a2ff',
						textColor: '4d5055',
					} }
				/>
			</Card>
		</Main>
	);
};

export default JetpackCheckoutScheduleAppointment;
