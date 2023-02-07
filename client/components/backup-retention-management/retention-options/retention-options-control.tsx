import { useEffect, useState, useCallback } from '@wordpress/element';
import React from 'react';
import { RetentionRadioOptionType } from '../consts';
import RetentionOptionCard from './retention-option-card';

interface RetentionOptionsControlProps {
	retentionOptions: Array< RetentionRadioOptionType >;
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
			{ retentionOptions.map( ( option ) => (
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
