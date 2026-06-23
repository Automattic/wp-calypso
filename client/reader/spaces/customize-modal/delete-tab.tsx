import { Button, __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

interface Props {
	spaceName: string;
	onDelete: () => void;
}

export function DeleteTab( { spaceName, onDelete }: Props ) {
	const translate = useTranslate();

	return (
		<VStack spacing={ 4 } className="customize-space-modal__delete-tab">
			<p className="customize-space-modal__delete-description">
				{ translate(
					'Delete %(name)s and remove it from your Reader spaces. This does not unfollow any sites or tags.',
					{ args: { name: spaceName } }
				) }
			</p>
			<Button __next40pxDefaultSize variant="primary" isDestructive onClick={ onDelete }>
				{ translate( 'Delete space' ) }
			</Button>
		</VStack>
	);
}
