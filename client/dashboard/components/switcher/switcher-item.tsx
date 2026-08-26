import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { Text } from '../text';

interface SwitcherItemProps {
	media?: React.ReactNode;
	title: React.ReactNode;
	description?: React.ReactNode;
	spacing?: number;
}

export default function SwitcherItem( { media, title, description, spacing }: SwitcherItemProps ) {
	const titleElement = (
		<Text
			className="switcher-item__title"
			weight={ 500 }
			truncate
			numberOfLines={ 1 }
			style={ { color: 'inherit' } }
		>
			{ title }
		</Text>
	);

	if ( ! media && ! description ) {
		return titleElement;
	}

	return (
		<HStack justify="flex-start" alignment="center" expanded spacing={ spacing }>
			{ media }
			<VStack spacing={ 0 }>
				{ titleElement }
				{ description && (
					<Text className="switcher-item__description" variant="muted" truncate numberOfLines={ 1 }>
						{ description }
					</Text>
				) }
			</VStack>
		</HStack>
	);
}
