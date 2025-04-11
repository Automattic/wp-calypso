/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import { Link, Page } from '../..';
import { PageActions } from './components/page-actions';

export function Categories() {
	return (
		<Page
			className="screen-home"
			title={ __( 'Categories', 'a8c-site-admin' ) }
			subTitle={ __( 'Manage your categories', 'a8c-site-admin' ) }
			actions={ <PageActions /> }
		>
			<div className="screen-main-area">
				<Link to="/">{ __( 'Go to the admin dashboard', 'a8c-site-admin' ) }</Link>
			</div>
		</Page>
	);
}
