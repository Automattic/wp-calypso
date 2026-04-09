import { SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useFormSelectors } from './hooks/use-form-selectors';

type Props = {
	setMinimumBudget: ( minimumBudget: string ) => void;
	selectedMinimumBudget: string;
};

const MinimumBudgetSelector = ( { setMinimumBudget, selectedMinimumBudget }: Props ) => {
	const { availableMinimumBudgets } = useFormSelectors();

	const options = [
		{ value: '', label: __( 'Select a minimum budget' ) },
		...Object.entries( availableMinimumBudgets ).map( ( [ value, label ] ) => ( {
			value,
			label,
		} ) ),
	];

	return (
		<SelectControl
			__next40pxDefaultSize
			value={ selectedMinimumBudget }
			options={ options }
			onChange={ setMinimumBudget }
		/>
	);
};

export default MinimumBudgetSelector;
