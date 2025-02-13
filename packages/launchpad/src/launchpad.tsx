import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { Dialog } from '@automattic/components';
import {
	Site,
	SiteDetails,
	type SiteSelect,
	sortLaunchpadTasksByCompletionStatus,
	useSortedLaunchpadTasks,
} from '@automattic/data-stores';
import { requiresUpgrade } from '@automattic/data-stores/src/site/selectors';
import { canInstallPlugins } from '@automattic/sites';
import { Button } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { number } from 'yargs';
import EligibilityWarnings from 'calypso/blocks/eligibility-warnings';
import { marketplacePlanToAdd } from 'calypso/lib/plugins/utils';
import { removePluginStatuses } from 'calypso/state/plugins/installed/status/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { useSiteTransfer } from '../../../client/landing/stepper/hooks/use-site-transfer/index';
import { ShareSiteModal } from './action-components';
import LaunchpadInternal from './launchpad-internal';
import { setUpActionsForTasks } from './setup-actions';
import type { EventHandlers, Task } from './types';

//Can we use wordpress/data instead?

export const SITE_STORE = Site.register( { client_id: '', client_secret: '' } );

type LaunchpadProps = {
	siteSlug: string | null;
	checklistSlug: string;
	launchpadContext: string | null;
	onSiteLaunched?: () => void;
	onTaskClick?: EventHandlers[ 'onTaskClick' ];
	onPostFilterTasks?: ( tasks: Task[] ) => Task[];
	highlightNextAction?: boolean;
};

const usePluginInstallation = () => {
	const dispatch = useDispatch();
	//Is it necessary to remove the plugin statuses?
	dispatch( removePluginStatuses( 'completed', 'error', 'up-to-date' ) );
	const selectedSite = useSelector( getSelectedSite );
	const siteCanInstallPlugins = canInstallPlugins( selectedSite as SiteDetails );
	const isUpgradeRequired = ! siteCanInstallPlugins;

	const install = () => {
		const plugin = {
			slug: 'sensei',
		};

		const installPluginURL = `/setup/plugin-bundle/checkForPlugins?siteSlug=${ selectedSite?.slug }&siteId=${ selectedSite.ID }&pluginSlug=${ plugin.slug }&skipConfirmation=1`;
		const billingPeriod = 'montly';

		if ( isUpgradeRequired ) {
			return page(
				`/checkout/${ selectedSite?.slug }/${ marketplacePlanToAdd(
					selectedSite?.plan,
					billingPeriod
				) }?redirect_to=${ encodeURIComponent( installPluginURL ) }`
			);
		}

		return page( installPluginURL );
	};

	return {
		install,
		isUpgradeRequired,
	};
};

const DialogElligibility = ( {
	isVisible,
	onClose,
}: {
	isVisible: boolean;
	onClose: () => void;
} ) => {
	const { install, isUpgradeRequired } = usePluginInstallation();

	const handleInstallPlugin = () => {
		install();
		onClose();
	};

	return (
		<Dialog
			additionalClassNames="plugin-details-cta__dialog-content"
			additionalOverlayClassNames="plugin-details-cta__modal-overlay"
			isVisible={ isVisible }
			title={ translate( 'Eligibility' ) }
			onClose={ onClose }
			showCloseIcon
		>
			{ isUpgradeRequired && (
				<EligibilityWarnings
					currentContext="plugin-details"
					isMarketplace={ false }
					standaloneProceed
					onProceed={ handleInstallPlugin }
				/>
			) }

			{ ! isUpgradeRequired && (
				<>
					<h1>Install the plugin</h1>
					<Button onClick={ handleInstallPlugin }> Install the Sensei Plugin</Button>
				</>
			) }
		</Dialog>
	);
};

const Launchpad = ( {
	siteSlug,
	checklistSlug,
	launchpadContext,
	onSiteLaunched,
	onTaskClick,
	onPostFilterTasks,
	highlightNextAction,
}: LaunchpadProps ) => {
	const {
		data: { checklist },
	} = useSortedLaunchpadTasks(
		launchpadContext ? siteSlug : null, // Prevents launchpad data from loading until launchpadContext is loaded
		checklistSlug,
		launchpadContext ?? ''
	);

	const tasklistCompleted = checklist?.every( ( task: Task ) => task.completed ) || false;
	const tracksData = { recordTracksEvent, checklistSlug, tasklistCompleted, launchpadContext };

	const site = useSelect(
		( select ) => {
			return siteSlug ? ( select( SITE_STORE ) as SiteSelect ).getSite( siteSlug ) : null;
		},
		[ siteSlug ]
	);
	const [ shareSiteModalIsOpen, setShareSiteModalIsOpen ] = useState( false );
	const [ eligibilityDialogIsOpen, setEligibilityDialogIsOpen ] = useState( false );

	const taskFilter = ( tasks: Task[] ) => {
		const baseTasks = setUpActionsForTasks( {
			tasks,
			siteSlug,
			tracksData,
			extraActions: {
				setShareSiteModalIsOpen,
				setEligibilityDialogIsOpen,
			},
			eventHandlers: {
				onSiteLaunched,
				onTaskClick,
			},
		} );

		if ( onPostFilterTasks ) {
			return onPostFilterTasks( baseTasks );
		}

		return baseTasks;
	};

	const launchpadOptions = {
		onSuccess: sortLaunchpadTasksByCompletionStatus,
	};

	if ( ! launchpadContext ) {
		return null;
	}

	return (
		<>
			{ shareSiteModalIsOpen && site && (
				<ShareSiteModal setModalIsOpen={ setShareSiteModalIsOpen } site={ site } />
			) }
			{ eligibilityDialogIsOpen && (
				<DialogElligibility
					onClose={ () => setEligibilityDialogIsOpen( false ) }
					isVisible={ eligibilityDialogIsOpen }
				/>
			) }
			<LaunchpadInternal
				site={ site }
				siteSlug={ siteSlug }
				checklistSlug={ checklistSlug }
				taskFilter={ taskFilter }
				useLaunchpadOptions={ launchpadOptions }
				launchpadContext={ launchpadContext }
				highlightNextAction={ highlightNextAction }
			/>
		</>
	);
};

export default Launchpad;
