import styled from '@emotion/styled';
import { CheckboxControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

const CheckboxWrapper = styled.div`
	margin-top: 16px;
`;

export default function SetAsPrimaryPaymentMethod( {
	isChecked,
	isDisabled,
	onChange,
}: {
	isChecked: boolean;
	isDisabled?: boolean;
	onChange: ( isChecked: boolean ) => void;
} ) {
	const translate = useTranslate();
	const reduxDispatch = useDispatch();

	const handleChangeEvent = ( newIsChecked: boolean ): void => {
		reduxDispatch(
			recordTracksEvent( 'calypso_partner_portal_add_credit_card_as_default_toggle', {
				old_value: isChecked,
				new_value: newIsChecked,
			} )
		);
		onChange( newIsChecked );
	};

	return (
		<CheckboxWrapper>
			<CheckboxControl
				className="credit-card-fields__set-as-primary-field"
				disabled={ isDisabled }
				checked={ isChecked }
				onChange={ handleChangeEvent }
				label={ translate( 'Set as primary payment method' ) }
			/>
		</CheckboxWrapper>
	);
}
