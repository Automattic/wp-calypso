import { SelectControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

type Props = {
	setBudget: ( minBudget: string ) => void;
	budgetLowerRange: string;
};
const BudgetSelector = ( { setBudget, budgetLowerRange }: Props ) => {
	const translate = useTranslate();

	const minBudgetList = [
		{
			label: translate( 'No minimum budget' ),
			value: '0',
		},
		{
			label: '$500',
			value: '500',
		},
		{
			label: '$5000',
			value: '5000',
		},
		{
			label: '$10000',
			value: '10000',
		},
		{
			label: '$20000',
			value: '20000',
		},
		{
			label: '$30000',
			value: '30000',
		},
		{
			label: '$45000',
			value: '45000',
		},
	];

	return (
		<SelectControl
			value={ budgetLowerRange }
			options={ minBudgetList }
			onChange={ setBudget }
		></SelectControl>
	);
};

export default BudgetSelector;
