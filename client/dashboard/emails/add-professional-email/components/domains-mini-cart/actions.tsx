import { __experimentalHStack as HStack, Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';

export const DomainsMiniCartActions = ( {
	onContinue,
	isCartBusy,
}: {
	onContinue: () => void;
	isCartBusy: boolean;
} ) => {
	const { __ } = useI18n();

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
