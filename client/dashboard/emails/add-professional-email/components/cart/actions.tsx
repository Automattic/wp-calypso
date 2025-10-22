import { __experimentalHStack as HStack, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export const CartActions = ( {
	onContinue,
	isCartBusy,
}: {
	onContinue: () => void;
	isCartBusy: boolean;
} ) => {
	return (
		<HStack spacing={ 4 } style={ { width: 'auto' } }>
			<Button
				variant="primary"
				onClick={ () => onContinue() }
				__next40pxDefaultSize
				disabled={ isCartBusy }
			>
				{ __( 'Continue' ) }
			</Button>
		</HStack>
	);
};
