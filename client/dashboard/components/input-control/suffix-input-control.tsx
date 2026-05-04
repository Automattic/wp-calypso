import {
	__experimentalInputControlSuffixWrapper as InputControlSuffixWrapper,
	privateApis,
} from '@wordpress/components';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import { useId, type ComponentProps } from 'react';
import { Text } from '../../components/text';

const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
	'@wordpress/components'
);
const { ValidatedInputControl } = unlock( privateApis );

export default function SuffixInputControl( {
	id,
	suffix,
	...props
}: ComponentProps< typeof ValidatedInputControl > ) {
	const fallbackId = useId();

	return (
		<ValidatedInputControl
			{ ...props }
			id={ id ?? fallbackId }
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
