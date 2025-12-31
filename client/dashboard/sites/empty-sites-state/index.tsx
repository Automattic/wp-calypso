import { BigSkyLogo } from '@automattic/components/src/logos/big-sky-logo';
import { JetpackLogo } from '@automattic/components/src/logos/jetpack-logo';
import { WordPressLogo } from '@automattic/components/src/logos/wordpress-logo';
import { formatNumber } from '@automattic/number-formatters';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';
import { reusableBlock } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { useAnalytics } from '../../app/analytics';
import { useHelpCenter } from '../../app/help-center';
import { Card, CardBody } from '../../components/card';
import EmptyState from '../../components/empty-state';
import { wpcomLink } from '../../utils/link';
import abstractDotsSvg from './abstract-dots.svg';

const CONTEXT = 'sites-dashboard';
const EMPTY_STATE_REF = 'sites-dashboard-empty-state';
const EMPTY_STATE_CTA_ID = 'sites-dashboard-empty-state';

export default function EmptySitesState() {
	const { recordTracksEvent } = useAnalytics();
	const { setShowHelpCenter } = useHelpCenter();
	const isSmallViewport = useViewportMatch( 'small', '<' );

	const trackEmptyStateActionClick = ( action: string ) => {
		recordTracksEvent( 'calypso_sites_dashboard_empty_state_action_click', {
			action,
		} );
	};

	const handleCreateSiteClick = () => {
		trackEmptyStateActionClick( 'create-site' );
	};

	const handleBuildWithAiClick = () => {
		setShowHelpCenter( false );
		trackEmptyStateActionClick( 'build-with-ai' );
	};

	const handleMigrateClick = () => {
		trackEmptyStateActionClick( 'migrate' );
	};

	const handleJetpackClick = () => {
		trackEmptyStateActionClick( 'migrate-via-jetpack' );
	};

	const handleOfferClick = () => {
		trackEmptyStateActionClick( 'offer' );
	};

	const createItYourselfHref = addQueryArgs( wpcomLink( '/start' ), {
		source: CONTEXT,
		ref: EMPTY_STATE_REF,
	} );

	const createWithAiHref = addQueryArgs( wpcomLink( '/setup/ai-site-builder' ), {
		source: CONTEXT,
		ref: EMPTY_STATE_REF,
	} );

	const migrateHref = wpcomLink(
		`/setup/site-migration?source=${ CONTEXT }&ref=${ EMPTY_STATE_REF }`
	);

	const jetpackHref = wpcomLink(
		`/jetpack/connect?cta_from=${ CONTEXT }&cta_id=${ EMPTY_STATE_CTA_ID }`
	);

	const offer = sprintf(
		// translators: %s is a percentage like 55% off
		__( 'Get a free domain and up to %s off' ),
		formatNumber( 0.55, {
			numberFormatOptions: { style: 'percent' },
		} )
	);

	return (
		<EmptyState
			title={ __( 'You don’t have any sites yet' ) }
			description={ __(
				'Start a site and begin creating, coding, or exploring what WordPress can do.'
			) }
		>
			<>
				<EmptyState.ActionList>
					<EmptyState.ActionItem
						title={ __( 'Create it yourself' ) }
						description={ __( 'Start with a clean WordPress site and make it yours.' ) }
						decoration={
							<WordPressLogo
								className="dashboard-empty-state-icon" /* Dummy class. We don't want the default classes' margin */
							/>
						}
						actions={
							<Button
								variant="primary"
								href={ createItYourselfHref.toString() }
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
								variant="primary"
								href={ createWithAiHref.toString() }
								onClick={ handleBuildWithAiClick }
								__next40pxDefaultSize
								size="compact"
							>
								{ __( 'Build with AI' ) }
							</Button>
						}
					/>
					<EmptyState.ActionItem
						title={ __( 'Migrate' ) }
						description={ __( 'Bring your site to the world’s best WordPress host.' ) }
						decoration={ reusableBlock }
						actions={
							<Button
								variant="secondary"
								href={ migrateHref }
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
						decoration={ <JetpackLogo /> }
						actions={
							<Button
								variant="secondary"
								href={ jetpackHref }
								onClick={ handleJetpackClick }
								size="compact"
								__next40pxDefaultSize
							>
								{ __( 'Migrate via Jetpack' ) }
							</Button>
						}
					/>
				</EmptyState.ActionList>
				<Card isBorderless variant="secondary">
					<CardBody>
						<HStack
							spacing={ isSmallViewport ? 2 : 6 }
							direction={ isSmallViewport ? 'column' : 'row' }
							alignment={ isSmallViewport ? 'flex-start' : 'center' }
						>
							{ ! isSmallViewport && (
								<img
									style={ { width: '64px', flexShrink: 0 } }
									src={ abstractDotsSvg }
									alt=""
									aria-hidden="true"
								/>
							) }
							<VStack spacing={ 1 }>
								<Text weight={ 500 }>{ offer }</Text>
								<Text variant="muted" as="p">
									{ sprintf(
										// translators: %s is a percentage like 55% off
										__(
											'Save up to %s on annual plans and get a free custom domain for a year. Your next site is just a step away.'
										),
										formatNumber( 0.55, {
											numberFormatOptions: { style: 'percent' },
										} )
									) }
								</Text>
							</VStack>
							<div style={ { flexShrink: 0 } }>
								<Button
									href={ wpcomLink( '/setup/onboarding' ) }
									onClick={ handleOfferClick }
									size="compact"
									__next40pxDefaultSize
								>
									{ __( 'Unlock offer' ) }
								</Button>
							</div>
						</HStack>
					</CardBody>
				</Card>
			</>
		</EmptyState>
	);
}
