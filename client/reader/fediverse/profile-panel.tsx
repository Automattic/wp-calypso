import { useTranslate } from 'i18n-calypso';
import EmptyContent from 'calypso/components/empty-content';
import type { FediverseConnection } from '@automattic/api-core';

interface Props {
	connection: FediverseConnection;
}

export function ProfilePanel( { connection }: Props ) {
	const translate = useTranslate();
	const blog = connection.name || connection.url;
	return (
		<EmptyContent
			title={ translate( 'Connected as %(handle)s', {
				args: { handle: connection.webfinger },
			} ) }
			line={ translate(
				'Posts you publish on %(blog)s will federate to the rest of the Fediverse.',
				{ args: { blog } }
			) }
			action={ translate( 'View on %(blog)s', { args: { blog } } ) }
			actionURL={ connection.url }
			actionTarget="_blank"
		/>
	);
}
