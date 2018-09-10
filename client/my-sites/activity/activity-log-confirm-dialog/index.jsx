/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import ActivityIcon from '../activity-log-item/activity-icon';
import Button from 'components/button';
import Card from 'components/card';
import Gridicon from 'gridicons';
import GridiconChat from 'gridicons/dist/chat';
import GridiconNotice from 'gridicons/dist/notice';
import HappychatButton from 'components/happychat/button';
import { recordTracksEvent } from 'state/analytics/actions';

/* eslint-disable wpcalypso/jsx-classname-namespace */
const ActivityLogConfirmDialog = ( {
	children,
	confirmTitle,
	icon = 'history',
	notice,
	onClose,
	onConfirm,
	supportLink,
	title,
	translate,
	happychatEvent,
} ) => (
	<div className="activity-log-item activity-log-item__restore-confirm">
		<div className="activity-log-item__type">
			<ActivityIcon activityIcon={ icon } />
		</div>
		<Card className="activity-log-item__card">
			<h5 className="activity-log-confirm-dialog__title">{ title }</h5>

			<div className="activity-log-confirm-dialog__highlight">{ children }</div>

			{ notice && (
				<div className="activity-log-confirm-dialog__notice">
					<Gridicon icon={ 'notice' } />
					{ notice }
				</div>
			) }

			<div className="activity-log-confirm-dialog__button-wrap">
				<div className="activity-log-confirm-dialog__primary-actions">
					<Button onClick={ onClose }>{ translate( 'Cancel' ) }</Button>
					<Button primary onClick={ onConfirm }>
						{ confirmTitle }
					</Button>
				</div>
				<div className="activity-log-confirm-dialog__secondary-actions">
					<Button
						borderless={ true }
						className="activity-log-confirm-dialog__more-info-link"
						href={ supportLink }
					>
						<GridiconNotice />
						<span className="activity-log-confirm-dialog__more-info-link-text">
							{ translate( 'More info' ) }
						</span>
					</Button>
					<HappychatButton
						className="activity-log-confirm-dialog__more-info-link"
						onClick={ happychatEvent }
					>
						<GridiconChat />
						<span className="activity-log-confirm-dialog__more-info-link-text">
							{ translate( 'Any Questions?' ) }
						</span>
					</HappychatButton>
				</div>
			</div>
		</Card>
	</div>
);
/* eslint-enable wpcalypso/jsx-classname-namespace */

const mapDispatchToProps = {
	happychatEvent: () => recordTracksEvent( 'calypso_activitylog_confirm_dialog' ),
};

export default connect(
	null,
	mapDispatchToProps
)( localize( ActivityLogConfirmDialog ) );
