/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import { Link, Page } from '../..';

export function DocsRoutingSystem() {
	return (
		<Page title={ __( 'Routing systems', 'a8c-site-admin' ) }>
			<div className="screen-content-area">
				{ __( 'Routing systems content..', 'a8c-site-admin' ) }
				<Link to="/">{ __( 'Go back to home', 'a8c-site-admin' ) }</Link>
			</div>
		</Page>
	);
}
