/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import EmptyContentComponent from 'components/empty-content';

function DomainConnectNotFoundError( { translate } ) {

console.log( 'blergfull' );

	const emptyContentTitle = translate( 'Uh oh. That method isn\'t supported.', {
		comment: 'Message displayed when requested Domain Connect method was not found',
	} );
	const emptyContentMessage = translate( 'Check with the service provider sent you here for more information.', {
		comment: 'Message displayed when requested Domain Connect method was not found',
	} );

	return (
		<Main>
			<EmptyContentComponent
				illustration="/calypso/images/illustrations/illustration-404.svg"
				title={ emptyContentTitle }
				line={ emptyContentMessage } />
		</Main>
	);
}

export default localize( DomainConnectNotFoundError );
