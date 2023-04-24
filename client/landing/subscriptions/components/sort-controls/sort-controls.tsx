import { useTranslate } from 'i18n-calypso';
import { ChangeEvent, ReactElement } from 'react';
import './styles.scss';

export type Option = {
	label: string;
	value: string;
};

type SortControlsProps< T > = {
	options: Option[];
	value: T;
	onChange: ( sortOrder: T ) => void;
};

const SortControls: < T extends string >( props: SortControlsProps< T > ) => ReactElement = ( {
	options,
	value,
	onChange,
} ) => {
	const translate = useTranslate();

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
					value={ value }
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
