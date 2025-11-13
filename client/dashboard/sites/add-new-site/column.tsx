import { __experimentalVStack as VStack, __experimentalText as Text } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';

function Column( { title, children }: { title?: string; children: React.ReactNode } ) {
	const isDesktop = useViewportMatch( 'medium' );
	return (
		<VStack justify="flex-start" spacing={ 4 } style={ { width: isDesktop ? '260px' : '100%' } }>
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
