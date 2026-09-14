import {
	Icon,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { staging, production } from '../icons';

export type EnvironmentType = 'production' | 'staging';

interface EnvironmentProps {
	environmentType: EnvironmentType;
}

const Environment = ( { environmentType }: EnvironmentProps ) => {
	const icon = environmentType === 'staging' ? staging : production;
	const label = environmentType === 'staging' ? __( 'Staging' ) : __( 'Production' );

	return (
		<HStack justify="flex-start" spacing={ 2 } expanded={ false } style={ { flexShrink: 0 } }>
			<Icon icon={ icon } size={ 20 } />
			<Text weight={ 500 }>{ label }</Text>
		</HStack>
	);
};

export default Environment;
