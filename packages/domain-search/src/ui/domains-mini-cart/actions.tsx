import { __experimentalHStack as HStack, Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';

export const DomainsMiniCartActions = ( {
	openFullCart,
	onContinue,
	isCartBusy,
}: {
	openFullCart: () => void;
	onContinue: () => void;
	isCartBusy: boolean;
} ) => {
	const { __ } = useI18n();

	return (
		<HStack spacing={ 4 } style={ { width: 'auto' } }>
			<Button
				className="domains-mini-cart-actions__view-cart"
				variant="tertiary"
				__next40pxDefaultSize
				onClick={ () => openFullCart() }
			>
				{ __( 'View cart' ) }
			</Button>
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
