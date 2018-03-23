/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import { TERM_MONTHLY, TERM_ANNUALLY, TERM_BIENNIALLY } from 'lib/plans/constants';
import TermPickerOption from 'components/term-picker-option';

const TermPickerOptionExample = () => (
	<div>
		<TermPickerOption term={ TERM_MONTHLY } price="$40" pricePerMonth="$3.33" checked={ false } />
		<TermPickerOption
			term={ TERM_ANNUALLY }
			price="$24"
			pricePerMonth="$2"
			savePercent={ 6 }
			checked={ true }
		/>
		<TermPickerOption
			term={ TERM_BIENNIALLY }
			price="$24"
			pricePerMonth="$1"
			savePercent={ 6 }
			checked={ false }
		/>
	</div>
);

TermPickerOptionExample.displayName = 'TermPickerOption';

export default TermPickerOptionExample;
