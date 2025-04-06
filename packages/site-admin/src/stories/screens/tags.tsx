/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import { Link, Page } from '../..';

export function Tags() {
	return (
		<Page
			className="screen-home"
			title={ __( 'Tags', 'a8c-site-admin' ) }
			subTitle={ __( 'Manage your tags', 'a8c-site-admin' ) }
		>
			<div className="screen-main-area">
				<Link to="/">{ __( 'Go to the admin dashboard', 'a8c-site-admin' ) }</Link>
			</div>
		</Page>
	);
}
