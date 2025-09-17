import { Icon, __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { staging, production } from '../icons';
import { EnvironmentType } from '../site-environment-badge';

interface EnvironmentProps {
	environmentType: EnvironmentType;
}

const Environment = ( { environmentType }: EnvironmentProps ) => {
	if ( environmentType === 'staging' ) {
		return (
			<HStack justify="flex-start" style={ { width: 'auto', flexShrink: 0 } }>
				<Icon icon={ staging } />
				<span>{ __( 'Staging' ) }</span>
			</HStack>
		);
	}

	return (
		<HStack justify="flex-start" style={ { width: 'auto', flexShrink: 0 } }>
			<Icon icon={ production } />
			<span>{ __( 'Production' ) }</span>
		</HStack>
	);
};

export default Environment;
