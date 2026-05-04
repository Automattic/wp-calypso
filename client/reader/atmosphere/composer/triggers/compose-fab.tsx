import { Button } from '@wordpress/components';
import { edit } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useComposer } from '../composer-provider';

export function ComposeFab() {
	const translate = useTranslate();
	const { mode, openComposer } = useComposer();

	if ( mode ) {
		return null;
	}

	return (
		<Button
			className="atmosphere-compose-fab"
			icon={ edit }
			label={ translate( 'Compose post' ) as string }
			onClick={ () => openComposer( { kind: 'standalone', entry_point: 'fab' } ) }
		/>
	);
}
