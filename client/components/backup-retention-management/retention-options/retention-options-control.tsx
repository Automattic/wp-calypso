import { useEffect, useState, useCallback } from '@wordpress/element';
import React from 'react';
import RetentionOptionCard from './retention-option-card';
import type { RetentionOptionInput } from '../types';

interface RetentionOptionsControlProps {
	retentionOptions: RetentionOptionInput[];
	currentRetentionPlan?: number;
	retentionSelected?: number;
	onChange: ( value: number ) => void;
}

const RetentionOptionsControl: React.FC< RetentionOptionsControlProps > = ( {
	retentionOptions,
	currentRetentionPlan,
	retentionSelected,
	onChange,
} ) => {
	const [ selectedOption, setSelectedOption ] = useState( retentionSelected );

	useEffect( () => {
		if ( typeof selectedOption === 'number' ) {
			onChange( selectedOption );
		}
	}, [ selectedOption, onChange ] );

	const handleRetentionOptionChange = useCallback( ( value: number ) => {
		setSelectedOption( value );
	}, [] );

	return (
		<div className="retention-form__options">
			{ retentionOptions.map( ( option ) => (
				<RetentionOptionCard
					value={ option.id }
					spaceNeededInBytes={ option.spaceNeededInBytes }
					upgradeRequired={ option.upgradeRequired }
					checked={ retentionSelected === option.id }
					isCurrentPlan={ currentRetentionPlan === option.id }
					// Given that we are working with a small set of options,
					// we could use the option id as a key
					key={ `retention-option-${ option.id }` }
					onChange={ handleRetentionOptionChange }
				/>
			) ) }
		</div>
	);
};

export default RetentionOptionsControl;
