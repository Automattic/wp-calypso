import { PLAN_BUSINESS, getPlan } from '@automattic/calypso-products';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { FC, ReactNode, FocusEvent } from 'react';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import './style.scss';

interface ScheduledUpdatesGateProps {
	needsUpgrade: boolean;
	children: ReactNode;
}

const ScheduledUpdatesGate: FC< ScheduledUpdatesGateProps > = ( { needsUpgrade, children } ) => {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug );

	const handleFocus = ( e: FocusEvent< HTMLDivElement > ) => {
		e.target.blur();
	};

	const titleText = translate(
		'Upgrade to the %(businessPlanName)s plan to access scheduled updates feature',
		{
			args: { businessPlanName: getPlan( PLAN_BUSINESS )?.getTitle() ?? '' },
		}
	);

	const href = addQueryArgs( `/checkout/${ siteSlug }/business`, {
		redirect_to: `/scheduled-updates/${ siteSlug }`,
	} );

	if ( needsUpgrade ) {
		return (
			<div tabIndex={ -1 } className="scheduled-updates-gate" onFocus={ handleFocus }>
				<UpsellNudge
					className="scheduled-updates-upsell-nudge"
					title={ titleText }
					event="calypso_scheduled_updates_upgrade_click"
					href={ href }
					callToAction={ translate( 'Upgrade' ) }
					plan={ PLAN_BUSINESS }
					showIcon={ true }
				/>
				<div className="scheduled-updates-gate__content">{ children }</div>
			</div>
		);
	}
	return <div>{ children }</div>;
};

export default ScheduledUpdatesGate;
