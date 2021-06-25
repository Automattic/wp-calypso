/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'calypso/components/main';
import EmptyContentComponent from 'calypso/components/empty-content';

function ThemeNotFoundError( { translate } ) {
	const emptyContentTitle = translate( 'Looking for great WordPress designs?', {
		comment: 'Message displayed when requested theme was not found',
	} );
	const emptyContentMessage = translate( 'Check our theme showcase', {
		comment: 'Message displayed when requested theme was not found',
	} );

	return (
		<Main>
			<EmptyContentComponent
				illustration="/calypso/images/illustrations/no-themes-drake.svg"
				title={ emptyContentTitle }
				line={ emptyContentMessage }
				action={ translate( 'View the showcase' ) }
				actionURL="/themes"
			/>
		</Main>
	);
}

export default localize( ThemeNotFoundError );
