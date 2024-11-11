import page from '@automattic/calypso-router';
import { dispatch } from '@wordpress/data';
import { Icon, link, linkOff } from '@wordpress/icons';
import { translate } from 'i18n-calypso';
import { navigate } from 'calypso/lib/navigate';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { PLUGINS_STATUS } from 'calypso/state/plugins/installed/status/constants';
import { Plugin } from 'calypso/state/plugins/installed/types';
import { CodeDeploymentData } from './use-code-deployments-query';

export function useActions( siteSlug: { siteSlug?: string }, onManualDeployment: () => void ) {
	const actions = [
		{
			id: 'manual-deployment',
			href: `some-url`,
			callback: ( plugins: Array< CodeDeploymentData > ) => {
				plugins.length && navigate( '/plugins/' + plugins[ 0 ].slug );

				dispatch( recordTracksEvent( 'calypso_hosting_github_manual_deployment_run_click' ) );
				onManualDeployment();
			},
			label: translate( 'Trigger manual deployment' ),
			isExternalLink: true,
			isEnabled: true,
		},
		{
			id: 'deployment-runs',
			href: `some-url`,
			callback: ( plugins: Array< CodeDeploymentData > ) => {
				dispatch( recordTracksEvent( 'calypso_hosting_github_see_deployment_runs_click' ) );
				page( viewDeploymentLogs( siteSlug, deployment.id ) );
			},
			label: translate( 'See deployment runs' ),
			isExternalLink: true,
			isEligible( plugin: Plugin ) {
				return plugin.status?.includes( PLUGINS_STATUS.INACTIVE ) ?? true;
			},
			icon: <Icon icon={ link } />,
		},
		{
			id: 'connection',
			href: `some-url`,
			callback: ( plugins: Array< CodeDeploymentData > ) => {},
			label: translate( 'Configure connection' ),
			isExternalLink: true,
			isEligible( plugin: CodeDeploymentData ) {
				return plugin.status?.includes( PLUGINS_STATUS.ACTIVE ) ?? true;
			},
			icon: <Icon icon={ linkOff } />,
		},
		{
			id: 'disconnect',
			href: `some-url`,
			callback: ( plugins: Array< CodeDeploymentData > ) => {},
			label: translate( 'Disconnect repository' ),
			icon: linkOff,
			isExternalLink: true,
			isEligible( plugin: CodeDeploymentData ) {
				return plugin.status?.includes( PLUGINS_STATUS.AUTOUPDATE_DISABLED ) ?? true;
			},
		},
	];

	return actions;
}
