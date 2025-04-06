import { __experimentalVStack as VStack } from '@wordpress/components';
import { Site } from '../data/types';
import SiteCard from './site-card';

/**
 * Sidebar component for the site overview page
 */
export default function Sidebar( { site }: { site: Site } ) {
	return (
		<VStack spacing={ 4 }>
			<SiteCard site={ site } />
		</VStack>
	);
}
