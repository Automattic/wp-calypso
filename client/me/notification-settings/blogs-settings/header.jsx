import { Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import SiteInfo from 'calypso/blocks/site';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';

/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */

class BlogSettingsHeader extends PureComponent {
	static propTypes = {
		site: PropTypes.object.isRequired,
		settings: PropTypes.object.isRequired,
		disableToggle: PropTypes.bool,
		onToggle: PropTypes.func.isRequired,
	};

	state = { isExpanded: false };

	toggleExpanded = () => {
		if ( this.props.disableToggle ) {
			return;
		}

		const isExpanded = ! this.state.isExpanded;
		this.setState( { isExpanded } );

		gaRecordEvent(
			'Notification Settings',
			isExpanded ? 'Expanded Site' : 'Collapsed Site',
			this.props.site.name
		);

		this.props.onToggle();
	};

	getLegend = () => {
		const { settings } = this.props;
		const {
			blog_id,
			devices,
			'email.achievement': emailAchievement,
			'email.store_order': emailStoreOrder,
			'email.scheduled_publicize': emailScheduledPublicize,
			'timeline.store_order': timelineStoreOrder,
			...filteredSettings
		} = settings;
		// Ignore the device_id of each device found.
		const devicesSettings = Object.values( devices ).map( ( device ) => {
			const { device_id, ...restDevice } = device;
			return restDevice;
		} );

		const allSettings = [
			...Object.values( filteredSettings ),
			...Object.values( devicesSettings ),
		]
			.map( ( set ) => Object.values( set ) )
			.flat();

		const { onCount, offCount } = allSettings.reduce(
			( acc, isOn ) => {
				const key = isOn ? 'onCount' : 'offCount';
				acc[ key ] += 1;
				return acc;
			},
			{ onCount: 0, offCount: 0 }
		);

		if ( ! onCount ) {
			return this.props.translate( 'No notifications' );
		}

		if ( ! offCount ) {
			return this.props.translate( 'All notifications' );
		}

		return this.props.translate( 'Some notifications' );
	};

	render() {
		const { site } = this.props;

		return (
			<header
				key={ site.wpcom_url }
				className="blogs-settings__header"
				onClick={ this.toggleExpanded }
			>
				<SiteInfo site={ site } indicator={ false } />
				<div className="blogs-settings__header-legend">
					<em>{ this.getLegend() }</em>
				</div>
				{ ! this.props.disableToggle ? (
					<div className="blogs-settings__header-expand">
						<a>
							<Gridicon
								icon={ this.state.isExpanded ? 'chevron-up' : 'chevron-down' }
								size={ 18 }
							/>
						</a>
					</div>
				) : null }
			</header>
		);
	}
}

export default localize( BlogSettingsHeader );
