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
	spacing?: number;
	iconSize?: number;
	weight?: React.CSSProperties[ 'fontWeight' ];
}

const Environment = ( { environmentType, spacing = 1, iconSize, weight }: EnvironmentProps ) => {
	if ( environmentType === 'staging' ) {
		return (
			<HStack
				justify="flex-start"
				spacing={ spacing }
				expanded={ false }
				style={ { flexShrink: 0 } }
			>
				<Icon icon={ staging } size={ iconSize } />
				<Text weight={ weight }>{ __( 'Staging' ) }</Text>
			</HStack>
		);
	}

	return (
		<HStack justify="flex-start" spacing={ spacing } expanded={ false } style={ { flexShrink: 0 } }>
			<Icon icon={ production } size={ iconSize } />
			<Text weight={ weight }>{ __( 'Production' ) }</Text>
		</HStack>
	);
};

export default Environment;
