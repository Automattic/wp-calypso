import { localize, fixMe } from 'i18n-calypso';
import EmptyContentComponent from 'calypso/components/empty-content';
import Main from 'calypso/components/main';

function DomainConnectNotFoundError( { translate } ) {
	const emptyContentTitle = fixMe( {
		text: "That method isn't supported.",
		newCopy: translate( "That method isn't supported.", {
			comment: 'Message displayed when requested Domain Connect URL path is not supported',
		} ),
		oldCopy: translate( "Uh oh. That method isn't supported.", {
			comment: 'Message displayed when requested Domain Connect URL path is not supported',
		} ),
	} );
	const emptyContentMessage = translate(
		'Check with the service provider that sent you here for more information.',
		{
			comment: 'Message displayed when requested Domain Connect URL path is not supported',
		}
	);

	return (
		<Main>
			<EmptyContentComponent title={ emptyContentTitle } line={ emptyContentMessage } />
		</Main>
	);
}

export default localize( DomainConnectNotFoundError );
