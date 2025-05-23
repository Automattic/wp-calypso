import { formatCurrency } from '@automattic/number-formatters';
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
			label: formatCurrency( 500, 'USD', {
				stripZeros: true,
			} ),
			value: '500',
		},
		{
			label: formatCurrency( 5000, 'USD', {
				stripZeros: true,
			} ),
			value: '5000',
		},
		{
			label: formatCurrency( 10000, 'USD', {
				stripZeros: true,
			} ),
			value: '10000',
		},
		{
			label: formatCurrency( 20000, 'USD', {
				stripZeros: true,
			} ),
			value: '20000',
		},
		{
			label: formatCurrency( 30000, 'USD', {
				stripZeros: true,
			} ),
			value: '30000',
		},
		{
			label: formatCurrency( 45000, 'USD', {
				stripZeros: true,
			} ),
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
