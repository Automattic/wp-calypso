/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import JetpackLogo from 'calypso/components/jetpack-logo';
import Main from 'calypso/components/main';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	authUrl: string;
}

const Connect: FunctionComponent< Props > = ( { authUrl } ) => {
	const translate = useTranslate();

	return (
		<Main className="connect">
			<div className="connect__content">
				<JetpackLogo full monochrome={ false } size={ 72 } />
				<p>
					{ translate(
						'Welcome to Jetpack. Authorize with your WordPress.com credentials to get started.'
					) }
				</p>
				<Button primary href={ authUrl }>
					{ translate( 'Authorize Jetpack' ) }
				</Button>
			</div>
		</Main>
	);
};

export default Connect;
