/**
 * External dependencies
 */
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import { Link, Page } from '../..';

export function Home() {
	return (
		<Page title={ __( 'Introduction', 'a8c-site-admin' ) }>
			<p>
				{ createInterpolateElement(
					__(
						'<strong>@automattic/site-admin</strong> is a reusable UI package designed to streamline the creation of modern administrative interfaces within the WordPress admin. It provides structured components, a routing system, and layout utilities inspired by the Site Editor (Gutenberg core), ensuring flexibility and independence from Core. This package prioritizes consistency with <strong>wp-admin</strong>, delivering a seamless and scalable admin experience with minimal external dependencies.',
						'a8c-site-admin'
					),
					{
						strong: <strong />,
					}
				) }
			</p>
			<p>
				{ createInterpolateElement(
					__(
						'Visit <Link>Components doc page</Link> for more information about the components available in the package.',
						'a8c-site-admin'
					),
					{
						Link: <Link to="/components">{ __( 'Components', 'a8c-site-admin' ) }</Link>,
					}
				) }
			</p>
			<p>
				{ createInterpolateElement(
					__(
						'<Link>The routing system</Link> provides details information about the routing system used in the package.',
						'a8c-site-admin'
					),
					{
						Link: <Link to="/routing-system">{ __( 'Routing system', 'a8c-site-admin' ) }</Link>,
					}
				) }
			</p>
		</Page>
	);
}
