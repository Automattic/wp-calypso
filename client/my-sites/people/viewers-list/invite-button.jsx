import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

const InviteButton = ( { siteSlug } ) => {
	const translate = useTranslate();

	if ( ! siteSlug ) {
		return null;
	}

	return (
		<Button primary href={ `/people/new/${ siteSlug }` }>
			<Gridicon icon="user-add" />
			<span>{ translate( 'Invite', { context: 'Verb. Button to invite more users.' } ) }</span>
		</Button>
	);
};

export default InviteButton;
