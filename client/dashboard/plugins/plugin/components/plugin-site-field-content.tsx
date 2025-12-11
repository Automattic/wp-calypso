import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { Name, URL, SiteIconLink, SiteLink } from '../../../sites/site-fields';
import type { Site } from '@automattic/api-core';

type PluginSiteFieldContentProps< T extends Site > = {
	site: T;
	name: string;
	url: string;
};

export function PluginSiteFieldContent< T extends Site >( {
	site,
	name,
	url,
}: PluginSiteFieldContentProps< T > ) {
	return (
		<HStack spacing={ 3 } alignment="center" justify="flex-start">
			<SiteIconLink site={ site } />
			<VStack spacing={ 0 } alignment="flex-start">
				<SiteLink site={ site }>
					<Name site={ site } value={ name } />
				</SiteLink>
				<URL site={ site } value={ url } />
			</VStack>
		</HStack>
	);
}
