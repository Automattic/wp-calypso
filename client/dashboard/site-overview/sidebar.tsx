import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import SiteCard from './site-card';

interface SidebarProps {
	siteName: string;
	siteUrl: string;
}

/**
 * Sidebar component for the site overview page
 */
export default function Sidebar( { siteName, siteUrl }: SidebarProps ) {
	return (
		<VStack spacing={ 4 } style={ { flex: 1 } }>
			<SiteCard
				title={ siteName }
				domain={ siteUrl }
				status="active"
				previewImageUrl={ `https://s0.wp.com/mshots/v1/${ encodeURIComponent(
					siteUrl
				) }?w=350&h=200` }
			/>
		</VStack>
	);
}
