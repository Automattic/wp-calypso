import { styled } from '@automattic/wpcom-checkout';
import { CheckboxControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

const CheckboxWrapper = styled.div`
	margin-top: 16px;

	.assign-to-all-payment-methods-checkbox input[type='checkbox']:checked {
		background: ${ ( props ) => props.theme.colors.primary };
		border-color: ${ ( props ) => props.theme.colors.primary };
	}

	a.inline-support-link.assign-to-all-payment-methods-checkbox__link {
		color: ${ ( props ) => props.theme.colors.primary };
	}
`;

export default function AssignToAllPaymentMethods( {
	isChecked,
	isDisabled,
	onChange,
}: {
	isChecked: boolean;
	isDisabled?: boolean;
	onChange: ( isChecked: boolean ) => void;
} ) {
	const translate = useTranslate();

	const handleChangeEvent = ( newIsChecked: boolean ): void => {
		recordTracksEvent( 'calypso_add_credit_card_form_assign_to_all_methods_toggle', {
			old_value: isChecked,
			new_value: newIsChecked,
		} );
		onChange( newIsChecked );
	};

	return (
		<CheckboxWrapper>
			<CheckboxControl
				className="assign-to-all-payment-methods-checkbox"
				disabled={ isDisabled }
				checked={ isChecked }
				onChange={ handleChangeEvent }
				label={
					translate(
						'Use this payment method for all subscriptions on my account. {{link}}Learn more.{{/link}}',
						{
							components: {
								link: (
									<InlineSupportLink
										className="assign-to-all-payment-methods-checkbox__link"
										supportContext="payment_method_all_subscriptions"
										showIcon={ false }
									/>
								),
							},
						}
						// As far as I can tell, label will correctly render the
						// component, so we cast to string to make the types work.
					) as string
				}
			/>
		</CheckboxWrapper>
	);
}
