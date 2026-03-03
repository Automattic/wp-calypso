import { TokenItem } from '@wordpress/components/build-types/form-token-field/types';
import { useCallback, useMemo } from 'react';
import FormTokenFieldWrapper from './form-token-field-wrapper';
import { reverseMap, useFormSelectors } from './hooks/use-form-selectors';

type Props = {
	setTimingPreferences: ( timingPreferences: string[] ) => void;
	selectedTimingPreferences: string[];
};

const TimingPreferencesSelector = ( {
	setTimingPreferences,
	selectedTimingPreferences,
}: Props ) => {
	const { availableTimingPreferences } = useFormSelectors();

	const availableTimingPreferencesByLabel = useMemo(
		() => reverseMap( availableTimingPreferences ),
		[ availableTimingPreferences ]
	);

	const selectedTimingPreferencesByLabel = selectedTimingPreferences.flatMap( ( slug ) => {
		const value = availableTimingPreferences[ slug ];
		return value ? [ value ] : [];
	} );

	const onTimingPreferencesSelected = useCallback(
		( selectedLabels: ( string | TokenItem )[] ) => {
			const selectedBySlug = selectedLabels.map( ( label ) => {
				return availableTimingPreferencesByLabel[ label as string ];
			} );
			setTimingPreferences( selectedBySlug );
		},
		[ availableTimingPreferencesByLabel, setTimingPreferences ]
	);

	return (
		<FormTokenFieldWrapper
			onChange={ onTimingPreferencesSelected }
			suggestions={ Object.values( availableTimingPreferences ) }
			value={ selectedTimingPreferencesByLabel }
		/>
	);
};

export default TimingPreferencesSelector;
