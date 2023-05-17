import { Onboard } from '@automattic/data-stores';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { ChangeEvent } from 'react';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import InfoPopover from 'calypso/components/info-popover';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import type { OnboardSelect } from '@automattic/data-stores';
import './style.scss';

const PaidMembershipsControl = () => {
	const { __ } = useI18n();
	const paidSubscribers = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getPaidSubscribers(),
		[]
	);
	const { setPaidSubscribers, setGoals, resetGoals } = useDispatch( ONBOARD_STORE );
	const onPaidSubscribersChanged = ( event: ChangeEvent< HTMLInputElement > ) => {
		const isPaidSelected = !! event?.target.checked;
		setPaidSubscribers( isPaidSelected );
		if ( isPaidSelected ) {
			setGoals( [ Onboard.SiteGoal.PaidSubscribers ] );
		} else {
			// Clears goals entirely each time. We could instead just removine the
			// PaidSubscribers goal and/or avoid doing anything if nothing wasn't set ever.
			resetGoals();
		}
	};

	return (
		<FormFieldset className="paid-memberships-control">
			<FormLabel>
				<FormInputCheckbox checked={ paidSubscribers } onChange={ onPaidSubscribersChanged } />
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
