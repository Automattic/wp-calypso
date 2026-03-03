import { SelectControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useFormSelectors } from './hooks/use-form-selectors';

type Props = {
	setMinimumBudget: ( minimumBudget: string ) => void;
	selectedMinimumBudget: string;
};

const MinimumBudgetSelector = ( { setMinimumBudget, selectedMinimumBudget }: Props ) => {
	const translate = useTranslate();
	const { availableMinimumBudgets } = useFormSelectors();

	const options = [
		{ value: '', label: translate( 'Select a minimum budget' ) },
		...Object.entries( availableMinimumBudgets ).map( ( [ value, label ] ) => ( {
			value,
			label,
		} ) ),
	];

	return (
		<SelectControl
			value={ selectedMinimumBudget }
			options={ options }
			onChange={ setMinimumBudget }
		/>
	);
};

export default MinimumBudgetSelector;
