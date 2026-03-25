import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';

interface SwitcherItemProps {
	media?: React.ReactNode;
	title: React.ReactNode;
	description?: React.ReactNode;
	spacing?: number;
	alignment?: string;
}

export default function SwitcherItem( {
	media,
	title,
	description,
	spacing,
	alignment = 'center',
}: SwitcherItemProps ) {
	if ( ! media && ! description ) {
		return <>{ title }</>;
	}

	return (
		<HStack justify="flex-start" alignment={ alignment } expanded spacing={ spacing }>
			{ media }
			<VStack spacing={ 0 }>
				{ title }
				{ description }
			</VStack>
		</HStack>
	);
}
