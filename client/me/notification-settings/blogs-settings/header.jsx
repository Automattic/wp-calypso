/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { localize } from 'i18n-calypso';
import { countBy, get, map, omit, values, flatten } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import SiteInfo from 'blocks/site';

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

		analytics.ga.recordEvent(
			'Notification Settings',
			isExpanded ? 'Expanded Site' : 'Collapsed Site',
			this.props.site.name
		);

		this.props.onToggle();
	};

	getLegend = () => {
		const { settings } = this.props;

		// Ignore blog_id, email.achievement and devices (we'll handle devices separately).
		const filteredSettings = {
			...omit( settings, [ 'blog_id', 'devices' ] ),
			email: omit( get( settings, 'email', {} ), [
				'achievement',
				'store_order',
				'scheduled_publicize',
			] ),
			timeline: omit( get( settings, 'timeline', {} ), 'store_order' ),
		};
		// Ignore the device_id of each device found.
		const devicesSettings = map( settings.devices, device => omit( device, 'device_id' ) );
		const { true: onCount, false: offCount } = countBy(
			// Here we're flattening the values of both sets of settings
			// as both sets have two 'streams' of settings: 'email' and 'timeline'
			[
				...flatten( map( filteredSettings, values ) ),
				...flatten( map( devicesSettings, values ) ),
			]
		);

		if ( ! onCount ) {
			return this.props.translate( 'no notifications' );
		}

		if ( ! offCount ) {
			return this.props.translate( 'all notifications' );
		}

		return this.props.translate( 'some notifications' );
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
