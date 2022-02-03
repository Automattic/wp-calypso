import styled from '@emotion/styled';
import { CheckboxControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

const CheckboxWrapper = styled.div`
	margin-top: 16px;
`;

export default function AssignToAllPaymentMethods( {
	isChecked,
	isDisabled,
	onChange,
}: {
	isChecked: boolean;
	isDisabled?: boolean;
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
				disabled={ isDisabled }
				checked={ isChecked }
				onChange={ handleChangeEvent }
				label={ translate(
					'Use this payment method for all subscriptions on my account. {{link}}Learn more.{{/link}}',
					{
						components: {
							link: (
								<InlineSupportLink
									supportContext="payment_method_all_subscriptions"
									showIcon={ false }
								/>
							),
						},
					}
				) }
			/>
		</CheckboxWrapper>
	);
}
