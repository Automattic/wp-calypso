import {
	DomainConnectionSetupMode,
	type DomainConnectionSetupModeValue,
} from '@automattic/api-core';
import { localizeUrl } from '@automattic/i18n-utils';
import {
	MAP_DOMAIN_CHANGE_NAME_SERVERS,
	MAP_EXISTING_DOMAIN_UPDATE_A_RECORDS,
} from '@automattic/urls';
import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	Icon,
} from '@wordpress/components';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { help } from '@wordpress/icons';

type HelpMessageProps = {
	mode: DomainConnectionSetupModeValue;
};
export default function HelpMessage( { mode }: HelpMessageProps ) {
	const supportLink: Partial< Record< DomainConnectionSetupModeValue, string > > = {
		[ DomainConnectionSetupMode.SUGGESTED ]: MAP_DOMAIN_CHANGE_NAME_SERVERS,
		[ DomainConnectionSetupMode.ADVANCED ]: MAP_EXISTING_DOMAIN_UPDATE_A_RECORDS,
		[ DomainConnectionSetupMode.DONE ]: MAP_DOMAIN_CHANGE_NAME_SERVERS,
	};

	if ( ! supportLink[ mode ] ) {
		return null;
	}

	return (
		<HStack justify="flex-start">
			<Icon icon={ help } size={ 16 } />
			<Text variant="muted">
				{ createInterpolateElement(
					__( 'Not finding your way? You can read our detailed <a>support documentation</a>.' ),
					{
						a: createElement( 'a', { href: localizeUrl( supportLink[ mode ] ), target: '_blank' } ),
					}
				) }
			</Text>
		</HStack>
	);
}
