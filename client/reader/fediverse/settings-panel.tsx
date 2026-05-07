import { useTranslate } from 'i18n-calypso';
import EmptyContent from 'calypso/components/empty-content';
import type { FediverseConnection } from '@automattic/api-core';

interface Props {
	connection: FediverseConnection;
}

export function SettingsPanel( { connection }: Props ) {
	const translate = useTranslate();
	return (
		<EmptyContent
			title={ translate( 'Settings' ) }
			line={ translate( 'Manage your connection to %(blog)s.', {
				args: { blog: connection.name || connection.url },
			} ) }
		/>
	);
}
