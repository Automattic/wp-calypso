import { useTranslate } from 'i18n-calypso';
import EmptyContent from 'calypso/components/empty-content';

interface Props {
	handle: string;
	actorUrl: string;
	siteHost: string;
}

export function ProfilePanel( { handle, actorUrl, siteHost }: Props ) {
	const translate = useTranslate();
	return (
		<EmptyContent
			title={ translate( 'You are connected as %(handle)s', { args: { handle } } ) }
			line={ translate( 'Posts you publish will appear on %(siteHost)s and across the Fediverse.', {
				args: { siteHost },
			} ) }
			action={ translate( 'View your profile on %(siteHost)s', { args: { siteHost } } ) }
			actionURL={ actorUrl }
			actionTarget="_blank"
		/>
	);
}
