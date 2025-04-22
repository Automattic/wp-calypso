import { useMakeStepActive } from '@automattic/composite-checkout';
import {
	Button,
	__experimentalSpacer as Spacer,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export interface PaymentMethodFilterProps {
	areStoredCardsFiltered: boolean | undefined;
	isBusinessCardsFilterEmpty: boolean | undefined;
}

export const PaymentMethodFilterNotice = ( {
	isBusinessCardsFilterEmpty,
}: {
	isBusinessCardsFilterEmpty?: boolean;
} ) => {
	let noticeText;

	if ( isBusinessCardsFilterEmpty ) {
		noticeText = __( 'There are no stored business cards on your account. Please add one below.' );
	} else {
		noticeText = __( 'Payment methods filtered by Business Cards' );
	}

	return (
		<Text color="var(--studio-gray-60)" size="14px">
			{ noticeText }
		</Text>
	);
};

export const PaymentMethodFilterButton = () => {
	const makeStepActive = useMakeStepActive();

	return (
		<Button
			className="checkout-step__edit-button"
			variant="link"
			onClick={ () => makeStepActive( 'contact-form' ) }
			label={ __( 'Remove payment method filter' ) }
		>
			<Text color="var(--color-link)" size="14px">
				{ __( 'Remove' ) }
			</Text>
		</Button>
	);
};

export const PaymentMethodFilter = ( {
	areStoredCardsFiltered,
	isBusinessCardsFilterEmpty,
}: PaymentMethodFilterProps ) =>
	areStoredCardsFiltered ? (
		<Spacer marginTop="16px" marginBottom="16px">
			<HStack alignment="center" justify="space-between">
				<PaymentMethodFilterNotice isBusinessCardsFilterEmpty={ isBusinessCardsFilterEmpty } />
				{ ! isBusinessCardsFilterEmpty && <PaymentMethodFilterButton /> }
			</HStack>
		</Spacer>
	) : null;
