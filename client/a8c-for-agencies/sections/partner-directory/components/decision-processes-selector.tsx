import { TokenItem } from '@wordpress/components/build-types/form-token-field/types';
import { useCallback, useMemo } from 'react';
import FormTokenFieldWrapper from './form-token-field-wrapper';
import { reverseMap, useFormSelectors } from './hooks/use-form-selectors';

type Props = {
	setDecisionProcesses: ( decisionProcesses: string[] ) => void;
	selectedDecisionProcesses: string[];
};

const DecisionProcessesSelector = ( {
	setDecisionProcesses,
	selectedDecisionProcesses,
}: Props ) => {
	const { availableDecisionProcesses } = useFormSelectors();

	const availableDecisionProcessesByLabel = useMemo(
		() => reverseMap( availableDecisionProcesses ),
		[ availableDecisionProcesses ]
	);

	const selectedDecisionProcessesByLabel = selectedDecisionProcesses.flatMap( ( slug ) => {
		const value = availableDecisionProcesses[ slug ];
		return value ? [ value ] : [];
	} );

	const onDecisionProcessesSelected = useCallback(
		( selectedLabels: ( string | TokenItem )[] ) => {
			const selectedBySlug = selectedLabels.map( ( label ) => {
				return availableDecisionProcessesByLabel[ label as string ];
			} );
			setDecisionProcesses( selectedBySlug );
		},
		[ availableDecisionProcessesByLabel, setDecisionProcesses ]
	);

	return (
		<FormTokenFieldWrapper
			onChange={ onDecisionProcessesSelected }
			suggestions={ Object.values( availableDecisionProcesses ) }
			value={ selectedDecisionProcessesByLabel }
		/>
	);
};

export default DecisionProcessesSelector;
