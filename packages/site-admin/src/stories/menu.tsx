import { __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import { Link } from '../router/components/link';

export function Menu() {
	return (
		<HStack justify="flex-start">
			<Link to="/reports">{ __( 'Reports', 'a8c-site-admin' ) }</Link>
			<Link to="/settings">{ __( 'Settings', 'a8c-site-admin' ) }</Link>
			<Link to="/archive">{ __( 'Archive', 'a8c-site-admin' ) }</Link>
		</HStack>
	);
}
