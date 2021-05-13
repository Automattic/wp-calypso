/**
 * External dependencies
 */

import React from 'react';
import { useTranslate } from 'i18n-calypso';
import Gridicon from 'calypso/components/gridicon';

export default function SelfHostedInstructions( { onClickClose } ) {
	const translate = useTranslate();

	return (
		<div className="auth__self-hosted-instructions">
			<button onClick={ onClickClose } className="auth__self-hosted-instructions-close">
				<Gridicon icon="cross" size={ 24 } />
			</button>

			<h2>{ translate( 'Add self-hosted site' ) }</h2>
			<p>
				{ translate(
					'By default when you sign into the WordPress.com app, you can edit blogs and sites hosted at WordPress.com'
				) }
			</p>
			<p>
				{ translate(
					"If you'd like to edit your self-hosted WordPress blog or site, you can do that by following these instructions:"
				) }
			</p>

			<ol>
				<li>
					<strong>{ translate( 'Install the Jetpack plugin.' ) }</strong>
					<br />
					<a href="http://jetpack.me/install/">
						{ translate( 'Please follow these instructions to install Jetpack' ) }
					</a>
					.
				</li>
				<li>{ translate( 'Connect Jetpack to WordPress.com.' ) }</li>
				<li>
					{ translate(
						'Now you can sign in to the app using the WordPress.com account Jetpack is connected to, ' +
							'and you can find your self-hosted site under the "My Sites" section.'
					) }
				</li>
			</ol>
		</div>
	);
}
