import { useTranslate } from 'i18n-calypso';
import EmptyContent from 'calypso/components/empty-content';

interface Props {
	connectionId: number;
	handle: string;
}

// connectionId is currently unused but kept on the interface for forward-compat (wiring up the inbox).
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function TimelinePanel( { connectionId: _connectionId, handle }: Props ) {
	const translate = useTranslate();
	return (
		<EmptyContent
			title={ translate( 'Your Fediverse activity will appear here' ) }
			line={ translate(
				"You're connected as %(handle)s. Compose a Note to broadcast to the Fediverse.",
				{ args: { handle } }
			) }
		/>
	);
}
