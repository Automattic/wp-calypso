/** @format */

/**
 * External dependencies
 */
import { ExternalLink, Placeholder } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import { icon } from './editor';

export default () => (
	<Placeholder icon={ icon } label={ __( 'Want to add a payment button to your site?' ) }>
		<p>
			{ __(
				"You're a contributor to this site, so you don't currently have permission to do this – only authors, editors, and administrators can add payment buttons."
			) }
		</p>
		<p>
			{ __(
				'Contact your site administrator for options! They can change your permissions or add the button for you.'
			) }
		</p>
		<ExternalLink href="https://support.wordpress.com/simple-payments/">
			{ __( 'Learn more about Simple Payments' ) }
		</ExternalLink>
	</Placeholder>
);
