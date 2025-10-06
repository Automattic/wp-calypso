import {
	__experimentalInputControlSuffixWrapper as InputControlSuffixWrapper,
	privateApis,
} from '@wordpress/components';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import { Text } from '../../components/text';
import type React from 'react';

const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
	'@wordpress/components'
);
const { ValidatedInputControl } = unlock( privateApis );

export default function SuffixInputControl( {
	suffix,
	...props
}: React.ComponentProps< typeof ValidatedInputControl > ) {
	return (
		<ValidatedInputControl
			{ ...props }
			suffix={
				<InputControlSuffixWrapper>
					<Text variant="muted" style={ { whiteSpace: 'nowrap' } }>
						{ suffix }
					</Text>
				</InputControlSuffixWrapper>
			}
		/>
	);
}
