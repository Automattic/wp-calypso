import { __experimentalVStack as VStack } from '@wordpress/components';
import { SiteObject } from '../data';
import SiteCard from './site-card';

/**
 * Sidebar component for the site overview page
 */
export default function Sidebar( { site }: { site: SiteObject } ) {
	return (
		<VStack spacing={ 4 }>
			<SiteCard site={ site } />
		</VStack>
	);
}
