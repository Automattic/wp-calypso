import { __ } from '@wordpress/i18n';
import React, { useState } from 'react';
import { BlankCanvas } from 'calypso/components/blank-canvas';
import FormattedHeader from 'calypso/components/formatted-header';

import './styles.scss';

const Feedback = () => (
	<FormattedHeader
		brandFont
		headerText={ __( 'Your thoughts are needed' ) }
		subHeaderText={ __(
			'Before you go, please answer a few quick questions to help us improve WordPress.com.'
		) }
	/>
);

const steps = [ Feedback ];

export const PurchaseCancelConfirm = ( { purchaseId, siteSlug } ) => {
	const [ currentStep ] = useState( 0 );
	const CurrentStepComponent = steps[ currentStep ];
	return (
		<BlankCanvas backUrl={ `/purchases/subscriptions/${ siteSlug }/${ purchaseId }/cancel` }>
			<CurrentStepComponent />
		</BlankCanvas>
	);
};
