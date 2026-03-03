import { TokenItem } from '@wordpress/components/build-types/form-token-field/types';
import { useCallback, useMemo } from 'react';
import FormTokenFieldWrapper from './form-token-field-wrapper';
import { reverseMap, useFormSelectors } from './hooks/use-form-selectors';

type Props = {
	setMigrationPlatforms: ( platforms: string[] ) => void;
	selectedMigrationPlatforms: string[];
};

const MigrationPlatformsSelector = ( {
	setMigrationPlatforms,
	selectedMigrationPlatforms,
}: Props ) => {
	const { availableMigrationPlatforms } = useFormSelectors();

	const availableMigrationPlatformsByLabel = useMemo(
		() => reverseMap( availableMigrationPlatforms ),
		[ availableMigrationPlatforms ]
	);

	const selectedMigrationPlatformsByLabel = selectedMigrationPlatforms.flatMap( ( slug ) => {
		const value = availableMigrationPlatforms[ slug ];
		return value ? [ value ] : [];
	} );

	const onMigrationPlatformsSelected = useCallback(
		( selectedLabels: ( string | TokenItem )[] ) => {
			const selectedBySlug = selectedLabels.map( ( label ) => {
				return availableMigrationPlatformsByLabel[ label as string ];
			} );
			setMigrationPlatforms( selectedBySlug );
		},
		[ availableMigrationPlatformsByLabel, setMigrationPlatforms ]
	);

	return (
		<FormTokenFieldWrapper
			onChange={ onMigrationPlatformsSelected }
			suggestions={ Object.values( availableMigrationPlatforms ).sort() }
			value={ selectedMigrationPlatformsByLabel }
		/>
	);
};

export default MigrationPlatformsSelector;
