import config from '@automattic/calypso-config';
import { Step } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { logToLogstash } from 'calypso/lib/logstash';
import { ONBOARD_STORE } from '../../../../stores';
import { waitForPluginsActive } from '../../../../utils/wait-for-plugins-active';
import { shouldUseStepContainerV2 } from '../../../helpers/should-use-step-container-v2';
import type { Step as StepType, FailureInfo } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';

export const installedStates = {
	PENDING: 'pending',
	INSTALLED: 'installed',
	ERROR: 'error',
} as const;

const WaitForPluginInstall: StepType = function WaitForAtomic( { navigation, data, flow } ) {
	const { submit } = navigation;
	const { setPendingAction } = useDispatch( ONBOARD_STORE );
	const pluginsToVerify = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getPluginsToVerify(),
		[]
	);

	const pendingActionsPromise = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getPendingAction(),
		[]
	);

	const siteId = data?.siteId;
	const siteSlug = data?.siteSlug;

	const handlePluginCheckFailure = ( failureInfo: FailureInfo ) => {
		recordTracksEvent( 'calypso_stepper_plugin_check_error', {
			action: failureInfo.type,
			site: siteId,
			code: failureInfo.code,
			error: failureInfo.error,
		} );

		logToLogstash( {
			feature: 'calypso_client',
			message: failureInfo.error,
			severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
			blog_id: siteId,
			properties: {
				env: config( 'env_id' ),
				type: 'calypso_stepper_plugin_check_error',
				action: failureInfo.type,
				site: siteId,
				code: failureInfo.code,
			},
		} );
	};

	useEffect( () => {
		if ( ! siteId || ! siteSlug ) {
			return;
		}

		setPendingAction( async () => {
			const totalTimeoutSeconds = 300;
			try {
				await waitForPluginsActive( siteId as number, pluginsToVerify, {
					totalTimeoutSeconds,
				} );
			} catch ( err ) {
				handlePluginCheckFailure( {
					type: 'plugin_check_timeout',
					error: `plugin check took too long (${ totalTimeoutSeconds }s))`,
					code: 'plugin_check_timeout',
				} );
				throw err;
			}

			// Add potential pending actions from other steps.
			let redirectTo = null;
			if ( typeof pendingActionsPromise === 'function' ) {
				const pendingActions = await pendingActionsPromise();
				redirectTo = pendingActions?.redirectTo;
			}

			return { redirectTo, pluginsInstalled: true, siteSlug, siteId };
		} );

		submit?.();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ siteId, siteSlug ] );

	if ( shouldUseStepContainerV2( flow ) ) {
		return <Step.Loading />;
	}

	return null;
};

export default WaitForPluginInstall;
