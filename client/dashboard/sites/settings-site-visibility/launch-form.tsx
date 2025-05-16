import {
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import type { Site } from '../../data/types';

export function LaunchForm( { site }: { site: Site } ) {
	return (
		<VStack spacing={ 4 } alignment="left">
			<Text>
				{ __(
					'Your site hasn\'t been launched yet. It is hidden from visitors behind a "Coming Soon" notice until it is launched.'
				) }
			</Text>
			<Button
				__next40pxDefaultSize
				variant="primary"
				href={ addQueryArgs( '/start/launch-site', {
					siteSlug: site.slug,
					new: site.name,
					hide_initial_query: 'yes',
				} ) }
			>
				{ __( 'Launch site' ) }
			</Button>
		</VStack>
	);
}
