import { useI18n } from '@wordpress/react-i18n';
import { ChangeEvent } from 'react';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import InfoPopover from 'calypso/components/info-popover';
import './style.scss';

interface PaidMembershipsControlProps {
	onChange: ( event: ChangeEvent< HTMLInputElement > ) => void;
	paidSubscribers: boolean;
}

const PaidMembershipsControl = ( { onChange, paidSubscribers }: PaidMembershipsControlProps ) => {
	const { __ } = useI18n();

	return (
		<FormFieldset className="setup-step__paid-subscribers">
			<FormLabel>
				<FormInputCheckbox checked={ paidSubscribers } onChange={ onChange } />
				<span>{ __( 'I want to start a paid newsletter' ) }</span>
			</FormLabel>
			<InfoPopover position="bottom right">
				{ __(
					'Let your audience support your work. Add paid subscriptions and gated content to your newsletter.'
				) }
			</InfoPopover>
		</FormFieldset>
	);
};

export default PaidMembershipsControl;
