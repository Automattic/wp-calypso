import {
	__experimentalDivider as Divider,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { Fragment } from 'react';
import { Text } from '../../components/text';
import { TextSkeleton } from '../../components/text-skeleton';

interface Stat {
	label: string;
	value: string;
}

export default function StatList( { stats, isLoading }: { stats: Stat[]; isLoading?: boolean } ) {
	return (
		<VStack spacing={ 2 }>
			{ stats.map( ( stat ) => (
				<Fragment key={ stat.label }>
					<HStack justify="space-between">
						<Text variant="muted" size={ 13 } lineHeight="20px">
							{ stat.label }
						</Text>
						<Text weight={ 500 } size={ 13 } lineHeight="20px">
							{ isLoading ? <TextSkeleton length={ 5 } /> : stat.value }
						</Text>
					</HStack>
					<Divider style={ { color: 'var(--dashboard-header__divider-color)' } } />
				</Fragment>
			) ) }
		</VStack>
	);
}
