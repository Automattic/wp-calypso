import styled from '@emotion/styled';
import { CheckboxControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import ExternalLink from 'calypso/components/external-link';

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
	// TODO: Add real "Learn more" link target
	return (
		<CheckboxWrapper>
			<CheckboxControl
				checked={ isChecked }
				onChange={ onChange }
				label={ translate(
					'Use this payment method for all subscriptions on my account. {{link}}Learn more.{{/link}}',
					{
						components: {
							link: <ExternalLink icon href="https://wordpress.com/support/manage-purchases/" />,
						},
					}
				) }
			/>
		</CheckboxWrapper>
	);
}
