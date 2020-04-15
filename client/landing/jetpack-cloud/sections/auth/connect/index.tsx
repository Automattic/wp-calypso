/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useTranslate } from 'i18n-calypso';
// import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
// import config from 'config';
import { Button } from '@automattic/components';
import JetpackLogo from 'components/jetpack-logo';
import Main from 'components/main';

interface Props {
	authUrl: string;
}

const Connect: FunctionComponent< Props > = ( { authUrl } ) => {
	const translate = useTranslate();

	return (
		<Main className="connect">
			<JetpackLogo full monochrome={ false } size={ 72 } />

			<div>
				<p>
					{ translate(
						'Welcome to Jetpack Cloud. Authorize with your WordPress.com credentials to get started.'
					) }
				</p>
				<Button primary href={ authUrl }>
					{ translate( 'Authorize Jetpack Cloud' ) }
				</Button>
			</div>
		</Main>
	);
};

export default Connect;
