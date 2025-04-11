/**
 * External dependencies
 */
import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { settings } from '@wordpress/icons';
import { useLocation } from '../../../router';

export function PageActions() {
	const { name } = useLocation();
	let title = '';

	switch ( name ) {
		case 'pages':
			title = __( 'Add a new page', 'site-admin' );
			break;
		case 'categories':
			title = __( 'Add a new category', 'site-admin' );
			break;
		case 'tags':
			title = __( 'Add a new Tag', 'site-admin' );
			break;
	}

	return (
		<HStack>
			<Button variant="primary">{ title }</Button>,
			{ name !== 'home' && <Button icon={ settings } /> }
		</HStack>
	);
}
