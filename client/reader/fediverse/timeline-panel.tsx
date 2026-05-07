import { useTranslate } from 'i18n-calypso';
import EmptyContent from 'calypso/components/empty-content';
import type { FediverseConnection } from '@automattic/api-core';

interface Props {
	connection: FediverseConnection;
}

export function TimelinePanel( { connection }: Props ) {
	const translate = useTranslate();
	return (
		<EmptyContent
			title={ translate( 'Your Fediverse activity will appear here' ) }
			line={ translate(
				'Connected as %(handle)s. Posts you publish from %(blog)s will show up here.',
				{ args: { handle: connection.webfinger, blog: connection.name || connection.url } }
			) }
		/>
	);
}
