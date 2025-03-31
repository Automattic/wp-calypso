/**
 * External dependencies
 */
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import { Link } from '../..';

export function DocsRoutingSystem() {
	return (
		<VStack>
			<h2>{ __( 'Routing systems', 'a8c-site-admin' ) }</h2>
			<VStack>
				{ __( 'Routing systems content..', 'a8c-site-admin' ) }
				<Link to="/">{ __( 'Go back to home', 'a8c-site-admin' ) }</Link>
			</VStack>
		</VStack>
	);
}
