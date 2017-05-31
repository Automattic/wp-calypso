/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { groupBy, map } from 'lodash';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug, isJetpackSite } from 'state/sites/selectors';
import StatsFirstView from '../stats-first-view';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import StatsNavigation from '../stats-navigation';
import ActivityLogDay from '../activity-log-day';
import ActivityLogErrorBanner from '../activity-log-banner/activity-log-error-banner';
import ActivityLogProgressBanner from '../activity-log-banner/activity-log-progress-banner';
import ActivityLogSuccessBanner from '../activity-log-banner/activity-log-success-banner';

class ActivityLog extends Component {
	componentDidMount() {
		window.scrollTo( 0, 0 );
	}

	logs = () => [
		{
			title: 'Site backed up',
			description: 'We backed up your site',
			user: null,
			type: 'site_backed_up',
			timestamp: 1485220539222
		},
		{
			title: 'Site has backed up Failed',
			description: 'We couldn\'t establish a connection to your site.',
			user: null,
			type: 'site_backed_up_failed',
			timestamp: 1485220539222
		},
		{
			title: 'Suspicious code detected in 2 plugin files.',
			description: 'Rewound in 17 January 2017 at 3:30 PM - We found potential warmful code in two of your ' +
			'Plugins: Yoast SEO and Advanced Custom Fields.',
			user: null,
			type: 'suspicious_code',
			timestamp: 1485220539222,
			className: 'is-disabled',
		},
		{
			title: 'Akismet activated',
			description: 'Akismet Plugin was successfully activated.',
			user: { ID: 123, name: 'Jane A', role: 'Admin' },
			type: 'plugin_activated',
			timestamp: 1485220539222
		},
		{
			title: 'Akismet deactivated',
			description: 'Akismet Plugin was successfully deactivated.',
			user: { ID: 123, name: 'Jane A', role: 'Admin' },
			type: 'plugin_deactivated',
			timestamp: 1485220539222
		},
		{
			title: 'Jetpack version 4.6 is available',
			description: 'A new version of the Jetpack Plugin was been released. Click here to update, or turn on ' +
			'auto-updates for Plugins and we\'ll manage those for you',
			user: null,
			type: 'plugin_needs_update',
			timestamp: 1485220539222
		},
		{
			title: 'Akismet updated to version 3.2',
			description: 'Akismet Plugin was successfully updated to its latest version: 3.2.',
			user: null,
			type: 'plugin_updated',
			timestamp: 1485220539222
		},
		{
			title: 'Twenty Eighteen Theme was activated',
			description: 'TwentyEighteen Plugin was successfully activated.',
			user: { ID: 123, name: 'Jane A', role: 'Admin' },
			type: 'theme_switched',
			timestamp: 1485220539222
		},
		{
			title: 'Twenty Sixteen updated to version 1.0.1',
			description: 'Twenty Sixteen Plugin was successfully updated to its latest version: 1.0.1.',
			user: { ID: 123, name: 'Jane A', role: 'Admin' },
			type: 'theme_updated',
			timestamp: 1485220539222
		},
		{
			title: 'Site updated to Professional Plan, Thank you',
			description: 'Professional Plan was successfully purchased for your site and is valid until February 15, 2018.',
			user: { ID: 123, name: 'Jane A', role: 'Admin' },
			type: 'plan_updated',
			timestamp: 1485220539222
		},
		{
			title: 'Professional Plan Renewed for another month',
			description: 'Professional Plan was renewed for another month and is valid until February 28, 2017',
			user: { ID: 123, name: 'Jane A', role: 'Admin' },
			type: 'plan_renewed',
			timestamp: 1485220539222
		},
		{
			title: 'Photon was activated',
			description: 'Photon module was activated in your site. All your images will now be served through the ' +
			'WordPress.com worldwide network.',
			user: { ID: 123, name: 'Jane A', role: 'Admin' },
			type: 'activate_jetpack_feature',
			timestamp: 1485220539222
		},
		{
			title: 'Custom CSS was deactivated',
			description: 'Custom CSS module was deactivated.',
			user: { ID: 123, name: 'Jane A', role: 'Admin' },
			type: 'deactivate_jetpack_feature',
			timestamp: 1485220539222
		},
		{
			title: 'This is some really cool post',
			description: '',
			user: { ID: 123, name: 'Jane A', role: 'Admin' },
			type: 'site_backed_up',
			timestamp: 1485220539222
		},
		{
			title: 'This is some really cool post',
			description: '',
			user: { ID: 123, name: 'Jane A', role: 'Admin' },
			type: 'site_backed_up',
			timestamp: 1485220539222
		},
		{
			title: 'This is some really cool post',
			description: '',
			user: { ID: 123, name: 'Jane A', role: 'Admin' },
			type: 'site_backed_up',
			timestamp: 1485220539222
		},
		{
			title: 'Jetpack updated to 4.5.1',
			subTitle: 'Plugin Update',
			description: '',
			icon: 'plugins',
			user: { ID: 123, name: 'Jane A', role: 'Admin' },
			time: '4:32pm',
			actionText: 'Undo',
			timestamp: 1483351202400
		},
		{
			title: 'Jetpack updated to 4.5.1',
			subTitle: 'Plugin Activated',
			description: '',
			icon: 'plugins',
			user: { ID: 123, name: 'Jane A', role: 'Admin' },
			time: '4:32pm',
			actionText: 'Undo',
			timestamp: 1483351202420
		},
		{
			title: 'Post Title',
			subTitle: 'Post Updated',
			description: '',
			icon: 'posts',
			user: { ID: 333, name: 'Jane A', role: 'Admin' },
			time: '10:55am',
			actionText: 'Undo',
			timestamp: 1483264820300
		}
	];

	update_logs( log ) {
		const { translate } = this.props;
		switch ( log.type ) {
			// Scans
			case 'security_threat_found':
				log.subTitle = translate( 'Security Threat Found!' );
				log.icon = 'notice';
				log.actionText = translate( 'Fix it' );
				break;
			// Backups
			case 'site_backed_up':
				log.subTitle = translate( 'Site Backed up' );
				log.icon = 'checkmark';
				log.status = 'is-success';
				log.actionText = 'Restore';
				break;
			// Backups
			case 'site_backed_up_failed':
				log.subTitle = translate( 'Site Backed up' );
				log.icon = 'notice';
				log.actionText = 'Fix';
				log.status = 'is-error';
				break;
			// Plugins
			case 'plugin_activated':
				log.subTitle = translate( 'Plugin Activated' );
				log.icon = 'plugins';
				log.actionText = 'Deactivate';
				break;
			case 'plugin_deactivated':
				log.subTitle = translate( 'Plugin Deactivated' );
				log.icon = 'plugins';
				log.actionText = 'Activate';
				break;
			case 'plugin_needs_update':
				log.subTitle = translate( 'Plugin Update Available' );
				log.icon = 'plugins';
				log.status = 'is-warning';
				log.actionText = 'Update';
				break;
			case 'suspicious_code':
				log.subTitle = translate( 'Security Scan' );
				log.icon = 'notice';
				log.status = 'is-error';
				log.actionText = 'Fix';
				break;
			case 'plugin_updated':
				log.subTitle = translate( 'Plugin Updated' );
				log.icon = 'plugins';
				log.actionText = 'Revert';
				break;

			// Themes
			case 'theme_switched':
				log.subTitle = translate( 'Theme Activated' );
				log.icon = 'themes';
				log.actionText = 'Revert';
				break;
			case 'theme_updated':
				log.subTitle = translate( 'Theme Updated' );
				log.icon = 'themes';
				log.actionText = 'Revert';
				break;
			// Plans
			case 'plan_updated':
				log.subTitle = translate( 'Plan' );
				log.icon = 'clipboard';
				log.actionText = 'Cancel';
				break;
			case 'plan_renewed':
				log.subTitle = translate( 'Plan Renewed' );
				log.icon = 'clipboard';
				break;
			// Jetpack Modules
			case 'activate_jetpack_feature':
				log.subTitle = translate( 'Jetpack' );
				log.icon = 'cog';
				log.actionText = 'Deactivate';
				break;
			case 'deactivate_jetpack_feature':
				log.subTitle = translate( 'Jetpack' );
				log.icon = 'cog';
				log.actionText = 'Activate';
				break;
		}

		return log;
	}

	renderBanner() {
		// FIXME: Logic to select/show 1 banner
		return <div>
			<ActivityLogErrorBanner />
			<ActivityLogProgressBanner />
			<ActivityLogSuccessBanner />
		</div>;
	}

	render() {
		const {
			isJetpack,
			moment,
			siteId,
			slug,
		} = this.props;
		const logs = this.logs();
		const logsGroupedByDate = map(
			groupBy(
				logs.map( this.update_logs, this ),
				( log ) => moment( log.timestamp ).startOf( 'day' ).toISOString()
			),
			( daily_logs, isoString ) => (
				<ActivityLogDay
					key={ isoString }
					dateString={ moment( isoString ).format( 'LL' ) }
					logs={ daily_logs }
					siteId={ siteId }
					isRewindEnabled={ true }
				/>
			)
		);

		return (
			<Main wideLayout={ true }>
				<StatsFirstView />
				<SidebarNavigation />
				<StatsNavigation
					isJetpack={ isJetpack }
					slug={ slug }
					section="activity"
				/>
				{ this.renderBanner() }
				<section className="activity-log__wrapper">
					{ logsGroupedByDate }
				</section>
			</Main>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const isJetpack = isJetpackSite( state, siteId );
		return {
			isJetpack,
			slug: getSiteSlug( state, siteId )
		};
	}
)( localize( ActivityLog ) );
