/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActivityIcon from '../activity-log-item/activity-icon';
import Button from 'components/button';
import Card from 'components/card';
import Gridicon from 'gridicons';
import HappychatButton from 'components/happychat/button';

class ActivityLogConfirmDialog extends Component {
	static propTypes = {
		applySiteOffset: PropTypes.func.isRequired,
		onClose: PropTypes.func.isRequired,
		onConfirm: PropTypes.func.isRequired,
		timestamp: PropTypes.number,

		// Localize
		translate: PropTypes.func.isRequired,
		moment: PropTypes.func.isRequired,
	};

	renderButtons() {
		const { onClose, onConfirm, translate } = this.props;
		return [
			<div className="activity-log-confirm-dialog__primary-actions">
				<Button onClick={ onClose }>{ translate( 'Cancel' ) }</Button>
				<Button primary onClick={ onConfirm }>
					{ translate( 'Confirm Rewind' ) }
				</Button>
			</div>,
			<div className="activity-log-confirm-dialog__secondary-actions">
				<a
					className="activity-log-confirm-dialog__more-info-link"
					href="https://help.vaultpress.com/one-click-restore/"
				>
					<Gridicon icon="notice" />
					<span className="activity-log-confirm-dialog__more-info-link-text">
						{ translate( 'More info' ) }
					</span>
				</a>
				<HappychatButton
					className="activity-log-confirm-dialog__more-info-link"
					href="https://help.vaultpress.com/one-click-restore/"
				>
					<Gridicon icon="chat" />
					<span className="activity-log-confirm-dialog__more-info-link-text">
						{ translate( 'Any Questions?' ) }
					</span>
				</HappychatButton>
			</div>,
		];
	}

	render() {
		const { applySiteOffset, moment, timestamp, translate } = this.props;

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<div className="activity-log-item activity-log-item__restore-confirm">
				<div className="activity-log-item__type">
					<ActivityIcon activityIcon={ 'history' } />
				</div>
				<Card className="activity-log-item__card">
					<h5 className="activity-log-confirm-dialog__title">{ translate( 'Rewind Site' ) }</h5>

					<p className="activity-log-confirm-dialog__highlight">
						{ translate(
							'This is the selected point for your site Rewind. ' +
								'Are you sure you want to rewind your site back to {{b}}%(time)s{{/b}}?',
							{
								args: {
									time: applySiteOffset( moment.utc( timestamp ) ).format( 'LLL' ),
								},
								components: { b: <b /> },
							}
						) }
					</p>

					<div className="activity-log-confirm-dialog__notice">
						<Gridicon icon={ 'notice' } />
						<span className="activity-log-confirm-dialog__notice-content">
							{ translate(
								'This will remove all content and options created or changed since then.'
							) }
						</span>
					</div>

					<div className="activity-log-confirm-dialog__button-wrap">{ this.renderButtons() }</div>
				</Card>
			</div>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default localize( ActivityLogConfirmDialog );
