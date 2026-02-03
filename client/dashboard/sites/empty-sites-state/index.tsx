import { BigSkyLogo } from '@automattic/components/src/logos/big-sky-logo';
import { JetpackLogo } from '@automattic/components/src/logos/jetpack-logo';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, reusableBlock, wordpress } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { useAnalytics } from '../../app/analytics';
import EmptyState from '../../components/empty-state';
import OfferCard from '../../components/offer-card';
import { wpcomLink } from '../../utils/link';

const CONTEXT = 'dashboard-sites';
const EMPTY_STATE_REF = 'dashboard-sites-empty-state';
const EMPTY_STATE_CTA_ID = 'dashboard-sites-empty-state';

function CreateAndBuildActions() {
	const { recordTracksEvent } = useAnalytics();

	const handleCreateSiteClick = () => {
		recordTracksEvent( 'calypso_sites_dashboard_empty_state_action_click', {
			action: 'create-site',
		} );
	};

	const handleBuildWithAiClick = () => {
		recordTracksEvent( 'calypso_sites_dashboard_empty_state_action_click', {
			action: 'build-with-ai',
		} );
	};

	return (
		<>
			<EmptyState.ActionItem
				title={ __( 'Create it yourself' ) }
				description={ __( 'Start with a clean WordPress site and make it yours.' ) }
				decoration={ <Icon icon={ wordpress } size={ 24 } /> }
				actions={
					<Button
						variant="secondary"
						href={ addQueryArgs( wpcomLink( '/start' ), {
							source: CONTEXT,
							ref: EMPTY_STATE_REF,
						} ) }
						onClick={ handleCreateSiteClick }
						size="compact"
						__next40pxDefaultSize
					>
						{ __( 'Create a site' ) }
					</Button>
				}
			/>
			<EmptyState.ActionItem
				title={ __( 'Build with AI' ) }
				description={ __( 'Describe your idea and let AI help you refine your site.' ) }
				decoration={ <BigSkyLogo.Mark /> }
				actions={
					<Button
						variant="secondary"
						href={ addQueryArgs( wpcomLink( '/setup/ai-site-builder' ), {
							source: CONTEXT,
							ref: EMPTY_STATE_REF,
						} ) }
						onClick={ handleBuildWithAiClick }
						__next40pxDefaultSize
						size="compact"
					>
						{ __( 'Build with AI' ) }
					</Button>
				}
			/>
		</>
	);
}

function EmptySitesStateUpsell() {
	const { recordTracksEvent } = useAnalytics();

	const handleOfferClick = () => {
		recordTracksEvent( 'calypso_sites_dashboard_empty_state_action_click', {
			action: 'offer',
		} );
	};

	return <OfferCard onClick={ handleOfferClick } />;
}

export function EmptySitesSearchStateContent() {
	return (
		<>
			<EmptyState.ActionList>
				<CreateAndBuildActions />
			</EmptyState.ActionList>
			<EmptySitesStateUpsell />
		</>
	);
}

export function EmptySitesStateContent() {
	const { recordTracksEvent } = useAnalytics();

	const handleMigrateClick = () => {
		recordTracksEvent( 'calypso_sites_dashboard_empty_state_action_click', {
			action: 'migrate',
		} );
	};

	const handleJetpackClick = () => {
		recordTracksEvent( 'calypso_sites_dashboard_empty_state_action_click', {
			action: 'migrate-via-jetpack',
		} );
	};

	return (
		<>
			<EmptyState.ActionList>
				<CreateAndBuildActions />
				<EmptyState.ActionItem
					title={ __( 'Migrate' ) }
					description={ __( 'Bring your site to the world’s best WordPress host.' ) }
					decoration={ <Icon icon={ reusableBlock } size={ 24 } /> }
					actions={
						<Button
							variant="secondary"
							href={ wpcomLink(
								`/setup/site-migration?source=${ CONTEXT }&ref=${ EMPTY_STATE_REF }`
							) }
							onClick={ handleMigrateClick }
							size="compact"
							__next40pxDefaultSize
						>
							{ __( 'Start migration' ) }
						</Button>
					}
				/>
				<EmptyState.ActionItem
					title={ __( 'Via the Jetpack plugin' ) }
					description={ __( 'Install the Jetpack plugin on an existing site.' ) }
					decoration={ <JetpackLogo size={ 24 } /> }
					actions={
						<Button
							variant="secondary"
							href={ wpcomLink(
								`/jetpack/connect?cta_from=${ CONTEXT }&cta_id=${ EMPTY_STATE_CTA_ID }`
							) }
							onClick={ handleJetpackClick }
							size="compact"
							__next40pxDefaultSize
						>
							{ __( 'Migrate via Jetpack' ) }
						</Button>
					}
				/>
			</EmptyState.ActionList>
			<EmptySitesStateUpsell />
		</>
	);
}
