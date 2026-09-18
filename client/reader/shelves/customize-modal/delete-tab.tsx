import { Button, __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

interface Props {
	shelfName: string;
	onDelete: () => void;
}

export function DeleteTab( { shelfName, onDelete }: Props ) {
	const translate = useTranslate();

	return (
		<VStack spacing={ 4 } className="customize-shelf-modal__delete-tab">
			<p className="customize-shelf-modal__delete-description">
				{ translate(
					'Delete %(name)s and remove it from your Reader shelves. This does not unfollow any sites or tags.',
					{ args: { name: shelfName } }
				) }
			</p>
			<Button __next40pxDefaultSize variant="primary" isDestructive onClick={ onDelete }>
				{ translate( 'Delete shelf' ) }
			</Button>
		</VStack>
	);
}
