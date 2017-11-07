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
		type: PropTypes.string,
		icon: PropTypes.string,

		// Localize
		translate: PropTypes.func.isRequired,
		moment: PropTypes.func.isRequired,
	};

	static defaultProps = {
		type: 'restore',
		icon: 'history',
	};

	handleClickCancel = () => this.props.onClose( this.props.type );
	handleClickConfirm = () => this.props.onConfirm( this.props.type );

	render() {
		const { applySiteOffset, moment, timestamp, translate, type, icon } = this.props;
		const activityTime = applySiteOffset( moment.utc( timestamp ) ).format( 'LLL' );
		const strings = {};

		switch ( type ) {
			case 'restore':
				strings.title = translate( 'Rewind Site' );
				strings.confirm = translate( 'Confirm Rewind' );
				strings.highlight = translate(
					'This is the selected point for your site Rewind. ' +
						'Are you sure you want to rewind your site back to {{b}}%(time)s{{/b}}?',
					{
						args: { time: activityTime },
						components: { b: <b /> },
					}
				);
				break;
			case 'backup':
				strings.title = translate( 'Create downloadable backup' );
				strings.confirm = translate( 'Create download' );
				strings.highlight = translate(
					'We will build a downloadable backup of your site at {{b}}%(time)s{{/b}}. ' +
						'You will get a notification when the backup is ready to download.',
					{
						args: { time: activityTime },
						components: { b: <b /> },
					}
				);
				break;
		}

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<div className="activity-log-item activity-log-item__restore-confirm">
				<div className="activity-log-item__type">
					<ActivityIcon activityIcon={ icon } />
				</div>
				<Card className="activity-log-item__card">
					<h5 className="activity-log-confirm-dialog__title">{ strings.title }</h5>

					<p className="activity-log-confirm-dialog__highlight">{ strings.highlight }</p>

					{ 'restore' === type && (
						<div className="activity-log-confirm-dialog__notice">
							<Gridicon icon={ 'notice' } />
							<span className="activity-log-confirm-dialog__notice-content">
								{ translate(
									'This will remove all content and options created or changed since then.'
								) }
							</span>
						</div>
					) }

					<div className="activity-log-confirm-dialog__button-wrap">
						<div className="activity-log-confirm-dialog__primary-actions">
							<Button onClick={ this.handleClickCancel }>{ translate( 'Cancel' ) }</Button>
							<Button primary onClick={ this.handleClickConfirm }>
								{ strings.confirm }
							</Button>
						</div>
						<div className="activity-log-confirm-dialog__secondary-actions">
							<Button
								borderless={ true }
								className="activity-log-confirm-dialog__more-info-link"
								href="https://help.vaultpress.com/one-click-restore/"
							>
								<Gridicon icon="notice" />
								<span className="activity-log-confirm-dialog__more-info-link-text">
									{ translate( 'More info' ) }
								</span>
							</Button>
							<HappychatButton
								className="activity-log-confirm-dialog__more-info-link"
								href="https://help.vaultpress.com/one-click-restore/"
							>
								<Gridicon icon="chat" />
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
	}
}

export default localize( ActivityLogConfirmDialog );
