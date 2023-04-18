import { useTranslate } from 'i18n-calypso';
import React, { useState, useEffect, ChangeEvent, ReactElement } from 'react';
import './styles.scss';

export type Option = {
	label: string;
	value: string;
};

type SortControlsProps< T > = {
	options: Option[];
	onChange?: ( sortOrder: T ) => void;
	value: T;
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

const SortControls: < T extends string >( props: SortControlsProps< T > ) => ReactElement = ( {
	options,
	onChange = noop,
	value,
} ) => {
	const translate = useTranslate();
	const [ selected, setSelected ] = useState( value );

	useEffect( () => {
		setSelected( value );
	}, [ value ] );

	const handleSelectChange = ( event: ChangeEvent< HTMLSelectElement > ) => {
		onChange( event?.target.value as typeof value );
	};

	return (
		<div className="subscription-manager-sort-controls">
			<label htmlFor="subscription-manager-sort-controls__select">
				{ translate( 'Sort by:' ) }
				<select
					id="subscription-manager-sort-controls__select"
					className="subscription-manager-sort-controls__select"
					onChange={ handleSelectChange }
					value={ selected }
				>
					{ options.map( ( option ) => (
						<option key={ `${ option.value }.${ option.label }` } value={ option.value }>
							{ option.label }
						</option>
					) ) }
				</select>
			</label>
		</div>
	);
};

export default SortControls;
