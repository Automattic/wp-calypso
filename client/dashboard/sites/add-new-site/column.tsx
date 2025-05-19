import { __experimentalVStack as VStack, __experimentalText as Text } from '@wordpress/components';

function Column( { title, children }: { title?: string; children: React.ReactNode } ) {
	return (
		<VStack spacing={ 4 } style={ { width: '260px' } }>
			{ title && (
				<Text variant="muted" size="subheadline" upperCase weight={ 500 }>
					{ title }
				</Text>
			) }
			{ children }
		</VStack>
	);
}

export default Column;
