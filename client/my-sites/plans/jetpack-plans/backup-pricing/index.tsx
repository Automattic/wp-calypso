import React, { useState } from 'react';
import Main from 'calypso/components/main';
import PlansFilterBar from '../plans-filter-bar';
import { BackupPricingProps, Duration } from '../types';

export const BackupPricing: React.FC< BackupPricingProps > = ( {
	defaultDuration,
	header,
	footer,
} ) => {
	const [ duration, setDuration ] = useState< Duration >( defaultDuration );

	return (
		<Main className="backup-pricing__main">
			{ header }
			<PlansFilterBar showDiscountMessage duration={ duration } onDurationChange={ setDuration } />
			<div>Hello world</div>
			{ footer }
		</Main>
	);
};
