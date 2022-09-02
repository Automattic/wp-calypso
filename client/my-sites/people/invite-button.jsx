import { isEnabled } from '@automattic/calypso-config';
import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

const InviteButton = ( { isPrimary = true, siteSlug } ) => {
	const translate = useTranslate();

	if ( ! siteSlug ) {
		return null;
	}

	return (
		<Button primary={ isPrimary } href={ `/people/new/${ siteSlug }` }>
			<Gridicon icon="user-add" />
			<span>
				{ isEnabled( 'subscriber-importer' )
					? translate( 'Invite User', { context: 'Verb. Button to invite more users.' } )
					: translate( 'Invite', { context: 'Verb. Button to invite more users.' } ) }
			</span>
		</Button>
	);
};

export default InviteButton;
