/**
 * External dependencies
 */
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import { Link, Page } from '../..';

export function DocsRoutingSystem() {
	return (
		<Page title={ __( 'Routing systems', 'a8c-site-admin' ) }>
			<VStack>
				{ __( 'Routing systems content..', 'a8c-site-admin' ) }
				<Link to="/">{ __( 'Go back to home', 'a8c-site-admin' ) }</Link>
			</VStack>
		</Page>
	);
}
