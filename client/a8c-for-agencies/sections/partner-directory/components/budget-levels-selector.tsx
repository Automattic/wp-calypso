import { TokenItem } from '@wordpress/components/build-types/form-token-field/types';
import { useCallback, useMemo } from 'react';
import FormTokenFieldWrapper from './form-token-field-wrapper';
import { reverseMap, useFormSelectors } from './hooks/use-form-selectors';

type Props = {
	setBudgetLevels: ( budgetLevels: string[] ) => void;
	selectedBudgetLevels: string[];
};

const BudgetLevelsSelector = ( { setBudgetLevels, selectedBudgetLevels }: Props ) => {
	const { availableBudgetLevels } = useFormSelectors();

	const availableBudgetLevelsByLabel = useMemo(
		() => reverseMap( availableBudgetLevels ),
		[ availableBudgetLevels ]
	);

	const selectedBudgetLevelsByLabel = selectedBudgetLevels.flatMap( ( slug ) => {
		const value = availableBudgetLevels[ slug ];
		return value ? [ value ] : [];
	} );

	const onBudgetLevelsSelected = useCallback(
		( selectedLabels: ( string | TokenItem )[] ) => {
			const selectedBySlug = selectedLabels.map( ( label ) => {
				return availableBudgetLevelsByLabel[ label as string ];
			} );
			setBudgetLevels( selectedBySlug );
		},
		[ availableBudgetLevelsByLabel, setBudgetLevels ]
	);

	return (
		<FormTokenFieldWrapper
			onChange={ onBudgetLevelsSelected }
			suggestions={ Object.values( availableBudgetLevels ) }
			value={ selectedBudgetLevelsByLabel }
		/>
	);
};

export default BudgetLevelsSelector;
