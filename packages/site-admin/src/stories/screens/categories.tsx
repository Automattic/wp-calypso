/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import { Link, Page } from '../..';

export function Categories() {
	return (
		<Page
			className="screen-home"
			title={ __( 'Categories', 'a8c-site-admin' ) }
			subTitle={ __( 'Manage your categories', 'a8c-site-admin' ) }
		>
			<div className="screen-main-area">
				<Link to="/">{ __( 'Go to the admin dashboard', 'a8c-site-admin' ) }</Link>
			</div>
		</Page>
	);
}
