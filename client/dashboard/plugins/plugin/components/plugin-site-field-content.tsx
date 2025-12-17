import { __experimentalVStack as VStack } from '@wordpress/components';
import { Name, URL, SiteLink } from '../../../sites/site-fields';
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
		<VStack spacing={ 0 } alignment="flex-start">
			<SiteLink site={ site }>
				<Name site={ site } value={ name } />
			</SiteLink>
			<URL site={ site } value={ url } />
		</VStack>
	);
}
