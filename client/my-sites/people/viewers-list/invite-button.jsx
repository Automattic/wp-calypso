import { Button, Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';

const InviteButton = ( { siteSlug, translate } ) => {
	return (
		<Button primary={ true } href={ `/people/new/${ siteSlug }` }>
			<Gridicon icon="user-add" />
			<span>{ translate( 'Invite', { context: 'Verb. Button to invite more users.' } ) }</span>
		</Button>
	);
};

export default localize( InviteButton );
