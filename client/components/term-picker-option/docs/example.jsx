/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import TermPickerOption from 'components/term-picker-option';

const TermPickerOptionExample = () => (
	<div>
		<TermPickerOption term="1 year" price="$40" pricePerMonth="$3.33/month" isActive={ false } />
		<TermPickerOption
			term="2 years"
			price="$24"
			pricePerMonth="only $2/month"
			savePercent={ 6 }
			isActive={ true }
		/>
		<TermPickerOption
			term="2 years"
			price="$24"
			pricePerMonth="only $2/month"
			savePercent={ 6 }
			isActive={ false }
		/>
	</div>
);

TermPickerOptionExample.displayName = 'TermPickerOption';

export default TermPickerOptionExample;
