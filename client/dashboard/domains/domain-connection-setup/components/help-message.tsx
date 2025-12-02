import {
	DomainConnectionSetupMode,
	type DomainConnectionSetupModeValue,
} from '@automattic/api-core';
import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	Icon,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { help } from '@wordpress/icons';
import InlineSupportLink from '../../../components/inline-support-link';

type HelpMessageProps = {
	mode: DomainConnectionSetupModeValue;
};
export default function HelpMessage( { mode }: HelpMessageProps ) {
	const supportLink: Partial< Record< DomainConnectionSetupModeValue, string > > = {
		[ DomainConnectionSetupMode.SUGGESTED ]: 'map-domain-change-name-servers',
		[ DomainConnectionSetupMode.ADVANCED ]: 'map-domain-update-a-records',
		[ DomainConnectionSetupMode.DONE ]: 'map-domain-change-name-servers',
	};

	if ( ! supportLink[ mode ] ) {
		return null;
	}

	return (
		<HStack justify="flex-start">
			<Icon icon={ help } size={ 16 } />
			<Text variant="muted">
				{ createInterpolateElement(
					__(
						'Not finding your way? You can read our detailed <link>support documentation</link>.'
					),
					{
						link: <InlineSupportLink supportContext={ supportLink[ mode ] } />,
					}
				) }
			</Text>
		</HStack>
	);
}
