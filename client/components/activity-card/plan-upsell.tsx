import { Card, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import * as React from 'react';
import ActivityActor from 'calypso/components/activity-card/activity-actor';
import Button from 'calypso/components/forms/form-button';
import { applySiteOffset } from 'calypso/lib/site/timezone';
import { useSelector } from 'calypso/state';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import type { Activity } from './types';

import './style.scss';

type OwnProps = {
	className?: string;
	summarize?: boolean;
	shareable?: boolean;
	activity: Activity;
	availableActions?: Array< string >;
	onClickClone?: ( period: string ) => void;
};

type Props = OwnProps & {
	upsellPlanName: string;
};

const PlanUpsellCard: React.FC< Props > = ( { upsellPlanName } ) => {
	const siteId = useSelector( getSelectedSiteId ) as number;
	const siteSlug = useSelector( getSelectedSiteSlug );
	const gmtOffset = useSelector( ( state ) => getSiteGmtOffset( state, siteId ) );
	const timezone = useSelector( ( state ) => getSiteTimezoneValue( state, siteId ) );
	const currentDateDisplay = applySiteOffset( Date.now(), { gmtOffset, timezone } ).format( 'LT' );
	const translate = useTranslate();

	return (
		<div className="activity-card-list__date-group-upsell">
			<div className="activity-card-list__date-group-date">{ translate( 'Older' ) }</div>
			<div className="activity-card-list__date-group-content">
				<div className="activity-card-list__secondary-card-with-more activity-card">
					<div className="activity-card__header">
						<div className="activity-card__time">
							<Gridicon icon="cog" className="activity-card__time-icon" />
							<div className="activity-card__time-text">{ currentDateDisplay }</div>
						</div>
					</div>
					<Card>
						<ActivityActor actorName="WordPress" actorType="Application" />
						<div className="activity-card__activity-description">
							Lorem ipsum dolor sit amet consectetur adipiscing elit
						</div>
						<div className="activity-card__activity-title">Laboris Nisi</div>
						<div className="activity-card__activity-overlay">
							<div className="activity-card__activity-overlay-content">
								<div className="activity-card__activity-overlay-lock">
									<Gridicon icon="lock" />
								</div>
								<p className="activity-card__activity-overlay-text">
									{ translate(
										'Upgrade to %(planName)s plan or higher to unlock more powerful features.',
										{
											args: {
												planName: upsellPlanName,
											},
											comment: '%(planName)s is the name of the selected plan.',
										}
									) }
								</p>
								<Button
									type="button"
									className="button activity-card__activity-overlay-button is-primary"
									href={ `https://wordpress.com/plans/${ siteSlug }` }
								>
									{ translate( 'Upgrade' ) }
								</Button>
							</div>
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default PlanUpsellCard;
