import { __experimentalText as Text, __experimentalVStack as VStack } from '@wordpress/components';
import { preventWidows } from 'calypso/lib/formatting';

import './empty-state.scss';

interface Props {
	title: string;
	message: string;
}

export default function SitesDashboardEmptyState( { title, message }: Props ) {
	return (
		<div className="sites-dashboard__empty-state">
			<VStack spacing={ 2 } alignment="center">
				<Text size={ 20 } weight={ 600 }>
					{ title }
				</Text>
				<Text variant="muted">{ preventWidows( message ) }</Text>
			</VStack>
		</div>
	);
}
