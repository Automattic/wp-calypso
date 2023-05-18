import { Onboard } from '@automattic/data-stores';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { ChangeEvent } from 'react';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import InfoPopover from 'calypso/components/info-popover';
import { useSiteSlug } from 'calypso/landing/stepper/hooks/use-site-slug';
import { ONBOARD_STORE, SITE_STORE } from 'calypso/landing/stepper/stores';
import type { OnboardSelect } from '@automattic/data-stores';
import './style.scss';

const PaidMembershipsControl = () => {
	const { __ } = useI18n();
	const siteSlug = useSiteSlug();
	const paidSubscribers = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getPaidSubscribers(),
		[]
	);
	const { setPaidSubscribers, setGoals, resetGoals } = useDispatch( ONBOARD_STORE );
	const { setGoalsOnSite } = useDispatch( SITE_STORE );
	const onPaidSubscribersChanged = ( event: ChangeEvent< HTMLInputElement > ) => {
		const isPaidSelected = !! event?.target.checked;
		const paidSubscriberGoal = [ Onboard.SiteGoal.PaidSubscribers ];
		setPaidSubscribers( isPaidSelected );

		if ( isPaidSelected ) {
			// Update goal in frontend state and DB
			setGoals( paidSubscriberGoal );
			setGoalsOnSite( siteSlug, paidSubscriberGoal );
		} else {
			// Clears goals entirely each time. We could instead removine the
			// PaidSubscribers goal and/or avoid action if nothing was ever set.
			// Again, must clear frontend state and DB.
			resetGoals();
			setGoalsOnSite( siteSlug, [] );
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
