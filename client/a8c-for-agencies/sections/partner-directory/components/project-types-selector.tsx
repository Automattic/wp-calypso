import { TokenItem } from '@wordpress/components/build-types/form-token-field/types';
import { useCallback, useMemo } from 'react';
import FormTokenFieldWrapper from './form-token-field-wrapper';
import { reverseMap, useFormSelectors } from './hooks/use-form-selectors';

type Props = {
	setProjectTypes: ( projectTypes: string[] ) => void;
	selectedProjectTypes: string[];
};

const ProjectTypesSelector = ( { setProjectTypes, selectedProjectTypes }: Props ) => {
	const { availableProjectTypes } = useFormSelectors();

	const availableProjectTypesByLabel = useMemo(
		() => reverseMap( availableProjectTypes ),
		[ availableProjectTypes ]
	);

	const selectedProjectTypesByLabel = selectedProjectTypes.flatMap( ( slug ) => {
		const value = availableProjectTypes[ slug ];
		return value ? [ value ] : [];
	} );

	const onProjectTypesSelected = useCallback(
		( selectedLabels: ( string | TokenItem )[] ) => {
			const selectedBySlug = selectedLabels.map( ( label ) => {
				return availableProjectTypesByLabel[ label as string ];
			} );
			setProjectTypes( selectedBySlug );
		},
		[ availableProjectTypesByLabel, setProjectTypes ]
	);

	return (
		<FormTokenFieldWrapper
			onChange={ onProjectTypesSelected }
			suggestions={ Object.values( availableProjectTypes ).sort() }
			value={ selectedProjectTypesByLabel }
		/>
	);
};

export default ProjectTypesSelector;
