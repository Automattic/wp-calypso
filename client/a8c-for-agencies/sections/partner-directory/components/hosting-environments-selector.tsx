import { TokenItem } from '@wordpress/components/build-types/form-token-field/types';
import { useCallback, useMemo } from 'react';
import FormTokenFieldWrapper from './form-token-field-wrapper';
import { reverseMap, useFormSelectors } from './hooks/use-form-selectors';

type Props = {
	setHostingEnvironments: ( environments: string[] ) => void;
	selectedHostingEnvironments: string[];
};

const HostingEnvironmentsSelector = ( {
	setHostingEnvironments,
	selectedHostingEnvironments,
}: Props ) => {
	const { availableHostingEnvironments } = useFormSelectors();

	const availableHostingEnvironmentsByLabel = useMemo(
		() => reverseMap( availableHostingEnvironments ),
		[ availableHostingEnvironments ]
	);

	const selectedHostingEnvironmentsByLabel = selectedHostingEnvironments.flatMap( ( slug ) => {
		const value = availableHostingEnvironments[ slug ];
		return value ? [ value ] : [];
	} );

	const onHostingEnvironmentsSelected = useCallback(
		( selectedLabels: ( string | TokenItem )[] ) => {
			const selectedBySlug = selectedLabels.map( ( label ) => {
				return availableHostingEnvironmentsByLabel[ label as string ];
			} );
			setHostingEnvironments( selectedBySlug );
		},
		[ availableHostingEnvironmentsByLabel, setHostingEnvironments ]
	);

	return (
		<FormTokenFieldWrapper
			onChange={ onHostingEnvironmentsSelected }
			suggestions={ Object.values( availableHostingEnvironments ).sort() }
			value={ selectedHostingEnvironmentsByLabel }
		/>
	);
};

export default HostingEnvironmentsSelector;
