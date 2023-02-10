import { useEffect, useState, useCallback } from '@wordpress/element';
import React from 'react';
import RetentionOptionCard from './retention-option-card';
import type { RetentionRadioOptionType } from '../types';

interface RetentionOptionsControlProps {
	retentionOptions: Record< number, RetentionRadioOptionType >;
	retentionSelected?: number;
	onChange: ( value: number ) => void;
}

const RetentionOptionsControl: React.FC< RetentionOptionsControlProps > = ( {
	retentionOptions,
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
			{ Object.values( retentionOptions ).map( ( option ) => (
				<RetentionOptionCard
					{ ...option }
					key={ option.value }
					onChange={ handleRetentionOptionChange }
				/>
			) ) }
		</div>
	);
};

export default RetentionOptionsControl;
