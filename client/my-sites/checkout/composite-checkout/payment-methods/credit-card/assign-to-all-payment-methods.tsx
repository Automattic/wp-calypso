import styled from '@emotion/styled';
import { CheckboxControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import ExternalLink from 'calypso/components/external-link';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

const CheckboxWrapper = styled.div`
	margin-top: 16px;
`;

export default function AssignToAllPaymentMethods( {
	isChecked,
	onChange,
}: {
	isChecked: boolean;
	onChange: ( isChecked: boolean ) => void;
} ): JSX.Element {
	const translate = useTranslate();
	const reduxDispatch = useDispatch();

	const handleChangeEvent = ( newIsChecked: boolean ): void => {
		reduxDispatch(
			recordTracksEvent( 'calypso_add_credit_card_form_assign_to_all_methods_toggle', {
				old_value: isChecked,
				new_value: newIsChecked,
			} )
		);
		onChange( newIsChecked );
	};

	return (
		<CheckboxWrapper>
			<CheckboxControl
				checked={ isChecked }
				onChange={ handleChangeEvent }
				label={ translate(
					'Use this payment method for all subscriptions on my account. {{link}}Learn more.{{/link}}',
					{
						components: {
							link: (
								<ExternalLink
									icon
									href="https://wordpress.com/support/payment/#using-a-payment-method-for-all-subscriptions"
								/>
							),
						},
					}
				) }
			/>
		</CheckboxWrapper>
	);
}
