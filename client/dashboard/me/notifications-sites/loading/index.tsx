import { Spinner, __experimentalHStack as HStack } from '@wordpress/components';

export const Loading = ( { style }: { style?: React.CSSProperties } ) => {
	return (
		<HStack style={ style } justify="center" alignment="center">
			<Spinner />
		</HStack>
	);
};
