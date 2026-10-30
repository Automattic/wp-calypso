import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { globe, group, scheduled } from '@wordpress/icons';
import { Text } from '../../components/text';
import { IconList } from './wordpress/migration-card';

const GUIDE_LIST = [
	{
		icon: group,
		text: __( 'We’ll bring over a copy of your site, without affecting the current live version.' ),
	},
	{
		icon: scheduled,
		text: __( 'You’ll get an update on the progress of your migration within 2–3 business days.' ),
	},
	{
		icon: globe,
		text: __( 'We’ll help you switch your domain over after the migration’s completed.' ),
	},
];

/**
 * What happens once our team has a migration, for both kinds of assisted migration.
 */
export function WhatToExpect() {
	return (
		<VStack spacing={ 3 }>
			<Text weight={ 500 }>{ __( 'Here’s what you can expect next:' ) }</Text>
			<IconList items={ GUIDE_LIST } />
		</VStack>
	);
}
