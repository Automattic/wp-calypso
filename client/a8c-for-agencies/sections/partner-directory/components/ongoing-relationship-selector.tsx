import { TokenItem } from '@wordpress/components/build-types/form-token-field/types';
import { useCallback, useMemo } from 'react';
import FormTokenFieldWrapper from './form-token-field-wrapper';
import { reverseMap, useFormSelectors } from './hooks/use-form-selectors';

type Props = {
	setOngoingRelationships: ( relationships: string[] ) => void;
	selectedOngoingRelationships: string[];
};

const OngoingRelationshipSelector = ( {
	setOngoingRelationships,
	selectedOngoingRelationships,
}: Props ) => {
	const { availableOngoingRelationships } = useFormSelectors();

	const availableOngoingRelationshipsByLabel = useMemo(
		() => reverseMap( availableOngoingRelationships ),
		[ availableOngoingRelationships ]
	);

	const selectedOngoingRelationshipsByLabel = selectedOngoingRelationships.flatMap( ( slug ) => {
		const value = availableOngoingRelationships[ slug ];
		return value ? [ value ] : [];
	} );

	const onOngoingRelationshipsSelected = useCallback(
		( selectedLabels: ( string | TokenItem )[] ) => {
			const selectedBySlug = selectedLabels.map( ( label ) => {
				return availableOngoingRelationshipsByLabel[ label as string ];
			} );
			setOngoingRelationships( selectedBySlug );
		},
		[ availableOngoingRelationshipsByLabel, setOngoingRelationships ]
	);

	return (
		<FormTokenFieldWrapper
			onChange={ onOngoingRelationshipsSelected }
			suggestions={ Object.values( availableOngoingRelationships ) }
			value={ selectedOngoingRelationshipsByLabel }
		/>
	);
};

export default OngoingRelationshipSelector;
