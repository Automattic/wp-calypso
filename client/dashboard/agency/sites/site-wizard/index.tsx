import { getDataCenterOptions } from '@automattic/api-core';
import { activeAgencyQuery, agencyDevLicensesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	Button,
	CheckboxControl,
	SelectControl,
	TextareaControl,
	Spinner,
	TextControl,
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, _n, isRTL, sprintf } from '@wordpress/i18n';
import { chevronLeft, chevronRight, Icon, people, reusableBlock, shield } from '@wordpress/icons';
import { useEffect, useId, useRef, useState } from 'react';
import { getPHPVersions } from 'calypso/data/php-versions';
import { useAnalytics } from '../../../app/analytics';
import { ActionList } from '../../../components/action-list';
import { Card } from '../../../components/card';
import SuffixInputControl from '../../../components/input-control/suffix-input-control';
import RouterLinkButton from '../../../components/router-link-button';
import { consumeWizardJump, setWizardPosition, useDesignPreview } from '../../design-preview';
import {
	getMarketplaceHostingSectionRoute,
	MARKETPLACE_PRODUCTS_ROUTE,
} from '../../marketplace/paths';
import { getFormatError } from '../../marketplace/purchases/use-site-address';
import { TEAM_ROUTE } from '../../team/paths';
import { isAgencyApproved, parseSiteUrl } from '../add-new-site/lib';
import AmplifyBackdrop from './amplify-backdrop';
import BellIllustration from './bell-illustration';
import { Choice, RadioChoice } from './choices';
import {
	ConnectionInstall,
	ConnectionSites,
	ConnectionSiteList,
	ConnectionTroubleshooting,
	PluginInstallMenu,
} from './connection-setup';
import CreateChoices from './create-choices';
import EntryChoices from './entry-choices';
import EntryIllustration from './entry-illustration';
import HostingChoice, { PressablePitchNote } from './hosting-choice';
import SitesOverviewStory from './overview-story';
import ReferralPreview from './referral-preview';
import { parseSiteList, SITE_REVIEW_BULK_THRESHOLD } from './site-intake';
import SiteIntake, { selectedSiteLabel } from './site-intake-form';
import SiteListInput, { SiteListSummary, SiteSummary } from './site-list-input';
import SiteReview from './site-review';
import {
	CallHelp,
	CreateQuestions,
	HostingFeatures,
	MoveQuestions,
	SupportHelp,
} from './step-details';
import { NumberedSteps, Section } from './step-kit';
import { useHostingEstimates } from './use-hosting-estimate';
import useSiteWizard from './use-site-wizard';
import type { IntakeSite } from './site-intake';
import type { Journey, Step } from './use-site-wizard';
import type { SiteWelcome } from './welcome-modal';
import type useSiteSimulation from '../../design-preview/use-site-simulation';
import type { AddNewSiteAction } from '../add-new-site/types';
import type { ReactNode } from 'react';
import './style.scss';

interface Props {
	simulation?: ReturnType< typeof useSiteSimulation >;
	onStart: () => void;
	onClose: () => void;
	/** Leaves the wizard for the Sites list, with a note about what just arrived. */
	onComplete?: ( welcome: SiteWelcome ) => void;
	onSelectAction: ( action: AddNewSiteAction ) => void;
	isFirstSite: boolean;
	/** Increments each time the page asks the wizard to start creating a new site. */
	createRequest?: number;
}
interface Action {
	label: string;
	onClick?: () => void;
	href?: string;
	external?: boolean;
}

export default function SiteWizard( {
	simulation,
	onStart,
	onClose,
	onComplete,
	onSelectAction,
	isFirstSite,
	createRequest = 0,
}: Props ) {
	const { recordTracksEvent } = useAnalytics();
	const { wizardJump, sitesRevision, entry: previewEntry } = useDesignPreview();
	const entry = isFirstSite ? previewEntry : 'cards';
	const { data: agency } = useQuery( activeAgencyQuery() );
	const developmentLicenses = useQuery( {
		...agencyDevLicensesQuery( agency?.id ?? 0 ),
		enabled: ! simulation && !! agency?.id,
	} );
	const {
		step,
		data,
		change,
		go: changeStep,
		back,
		restart,
		jump,
		error,
		setError,
		result,
		setResult,
	} = useSiteWizard( onStart, String( sitesRevision ) );
	useEffect( () => {
		if ( wizardJump && simulation ) {
			jump( wizardJump );
			consumeWizardJump();
		}
	}, [ wizardJump, simulation, jump ] );
	useEffect( () => {
		setWizardPosition( {
			step,
			journey: data.journey,
			host: data.host,
			method: data.method,
			billing: data.billing,
		} );
	}, [ step, data.journey, data.host, data.method, data.billing ] );
	useEffect( () => () => setWizardPosition( null ), [] );
	const container = useRef< HTMLDivElement >( null );
	const titleId = useId();
	const [ siteDraft, setSiteDraft ] = useState( '' );
	const isUrlStep = step === 'url' || step === 'source';
	// These steps show errors next to their address field instead of above the actions.
	const hasFieldError = isUrlStep || ( step === 'start' && entry === 'address' );
	const previousStep = useRef( step );
	useEffect( () => {
		if ( previousStep.current !== step ) {
			let target = isUrlStep ? '.agency-site-wizard__url-input textarea' : 'h2';
			if ( step === 'start' && entry === 'address' ) {
				target = '.agency-site-wizard__site-list input';
			}
			container.current?.querySelector< HTMLElement >( target )?.focus();
			previousStep.current = step;
		}
	}, [ step, isUrlStep, entry ] );
	const go = ( next: Step ) => {
		recordTracksEvent( 'calypso_a4a_site_wizard_step', { step: next, preview: !! simulation } );
		changeStep( next );
	};
	const [ isChecking, setIsChecking ] = useState( false );
	const afterCheck = useRef< () => void >( undefined );
	useEffect( () => {
		if ( ! isChecking ) {
			return;
		}
		const timer = setTimeout( () => {
			setIsChecking( false );
			afterCheck.current?.();
		}, 800 );
		return () => clearTimeout( timer );
	}, [ isChecking ] );
	// The preview has no real connection to check, so it pauses and then runs `then`.
	const checkConnections = ( then: () => void ) => {
		afterCheck.current = then;
		setIsChecking( true );
	};
	const lastCreateRequest = useRef( createRequest );
	useEffect( () => {
		if ( createRequest === lastCreateRequest.current ) {
			return;
		}
		lastCreateRequest.current = createRequest;
		recordTracksEvent( 'calypso_a4a_site_wizard_step', { step: 'new', preview: !! simulation } );
		changeStep( 'new' );
	}, [ createRequest, changeStep, recordTracksEvent, simulation ] );
	const chooseJourney = ( journey: Journey, next: Step ) => {
		change( { journey, undecided: false } );
		go( next );
	};
	const hostName = data.host === 'wpcom' ? 'WordPress.com' : 'Pressable';
	const source = parseSiteUrl( data.url );
	const knownSite = simulation?.import.sites.find(
		( site ) => parseSiteUrl( site.URL )?.host === source?.host
	);
	const isMigration = data.journey === 'migrate';
	const isDevelopment = data.journey === 'development';
	const addressSuffix = data.host === 'wpcom' ? '.wpcomstaging.com' : '.mystagingwebsite.com';
	const suggestedAddress = data.name.toLowerCase().replace( /[^a-z0-9]/g, '' ) || 'clientsite';
	const siteAddress = `${ data.address || suggestedAddress }${ addressSuffix }`;
	// Entry C asks for addresses first and the keep-or-move question after them.
	const reviewSites = ( input: string, undecided = data.undecided ) => {
		const { sites, duplicates } = parseSiteList( input );
		if ( ! sites.length ) {
			setError(
				__(
					'We couldn’t find any website addresses. Try yourgroovydomain.com, or paste the address column from your spreadsheet.'
				)
			);
			return;
		}
		const eligible = sites.filter(
			( site ) =>
				! data.completed.includes( site.id ) &&
				( isMigration || ! simulation?.managedSites.some( ( managed ) => managed.url === site.id ) )
		);
		if ( sites.length === 1 && ! eligible.length ) {
			setError( __( 'This site has already been added to your agency dashboard.' ) );
			return;
		}
		change( {
			sites,
			duplicates,
			chosen: sites.length <= SITE_REVIEW_BULK_THRESHOLD ? eligible.map( ( site ) => site.id ) : [],
			url: sites[ 0 ].url,
			...( undecided ? { journey: 'connect' as const, undecided } : {} ),
		} );
		let nextStep: Step = isMigration ? 'host' : 'authorize';
		if ( undecided ) {
			nextStep = 'path';
		}
		go( sites.length === 1 ? nextStep : 'review' );
	};
	const managedSites = simulation?.managedSites.map( ( site ) => site.url ) ?? [];
	// Entry C lists every site as it's added, so it skips the separate review step.
	const continueWithSites = () => {
		const input = [ data.intake, siteDraft ].filter( Boolean ).join( '\n' );
		const { sites, duplicates } = parseSiteList( input );
		const eligible = sites.filter(
			( site ) => ! data.completed.includes( site.id ) && ! managedSites.includes( site.id )
		);
		if ( ! eligible.length ) {
			setError(
				sites.length
					? __( 'These sites are already in your agency dashboard.' )
					: __( 'Add a site address to continue.' )
			);
			return;
		}
		setSiteDraft( '' );
		change( {
			intake: input,
			sites,
			duplicates,
			chosen: eligible.map( ( site ) => site.id ),
			url: eligible[ 0 ].url,
			journey: 'connect',
			undecided: true,
		} );
		go( 'path' );
	};
	const batch = data.sites.filter( ( site ) => data.chosen.includes( site.id ) );
	const batchSize = Math.max( 1, batch.length );
	const hostingCount = isMigration ? batchSize : 1;
	const hosting = useHostingEstimates( hostingCount );
	const phpVersions = getPHPVersions();
	const continueReview = () => {
		if ( ! batch.length ) {
			setError( __( 'Select at least one site to continue.' ) );
			return;
		}
		change( { url: batch[ 0 ].url } );
		if ( data.undecided ) {
			go( 'path' );
			return;
		}
		go( isMigration ? 'host' : 'authorize' );
	};
	const finish = ( kind: 'connect' | 'picker' | 'create' | 'migrate', ids = data.selected ) => {
		if ( ! simulation ) {
			return;
		}
		const siteName = data.name || siteAddress;
		let welcome: SiteWelcome;
		if ( kind === 'picker' ) {
			simulation.import.onImport( ids );
			welcome = {
				kind: 'connect',
				title: sprintf(
					/* translators: %d is the number of connected sites. */
					_n( '%d site connected', '%d sites connected', ids.length ),
					ids.length
				),
				description: __( 'They’re in your Sites list, on the same hosting as before.' ),
			};
		} else if ( kind === 'connect' ) {
			for ( const site of batch ) {
				const accountSite = simulation.import.sites.find(
					( candidate ) => parseSiteUrl( candidate.URL )?.host === parseSiteUrl( site.url )?.host
				);
				if ( accountSite ) {
					simulation.import.onImport( [ accountSite.ID ] );
				} else {
					simulation.onConnect( site.url, site.name );
				}
			}
			welcome = {
				kind: 'connect',
				title:
					batchSize === 1
						? __( 'Your site is connected' )
						: sprintf(
								/* translators: %d is the number of sites. */
								__( '%d sites connected' ),
								batchSize
							),
				description: _n(
					'It’s in your Sites list, on the same hosting as before.',
					'They’re in your Sites list, on the same hosting as before.',
					batchSize
				),
			};
		} else if ( kind === 'migrate' ) {
			for ( const site of batch ) {
				simulation.onCreateHosted( site.url, site.name, data.host );
			}
			welcome = {
				kind: 'migrate',
				title: sprintf(
					/* translators: 1: The number of sites. 2: The hosting provider. */
					_n( '%1$d site moved to %2$s', '%1$d sites moved to %2$s', batchSize ),
					batchSize,
					hostName
				),
				description: __(
					'Domain changes can take a few hours to reach everyone. Once your sites look right, cancel your old hosting.'
				),
			};
		} else {
			simulation.onCreateHosted( siteAddress, data.name, data.host, isDevelopment );
			welcome = isDevelopment
				? {
						kind: 'development',
						title: sprintf(
							/* translators: %s is a site name. */
							__( '%s is ready' ),
							siteName
						),
						description: __(
							'It’s in your Sites list and free while you build. Add hosting when you launch.'
						),
					}
				: {
						kind: 'hosted',
						title: sprintf(
							/* translators: %s is a site name. */
							__( '%s is ready' ),
							siteName
						),
						description: sprintf(
							/* translators: %s is the hosting provider. */
							__(
								'It’s hosted on %s and in your Sites list. Connect your client’s domain when you launch.'
							),
							hostName
						),
					};
		}
		const completed =
			kind === 'connect' || kind === 'migrate'
				? [ ...new Set( [ ...data.completed, ...data.chosen ] ) ]
				: data.completed;
		const remaining = data.sites.some( ( site ) => ! completed.includes( site.id ) );
		// A partial batch stays in the wizard so the rest of the portfolio is one click away.
		if ( onComplete && ! ( remaining && kind !== 'create' ) ) {
			onComplete( welcome );
			return;
		}
		setResult( welcome.title );
		change( { completed } );
		go( 'success' );
	};
	const completeSetup = () => {
		if ( isMigration ) {
			go( data.method === 'concierge' ? 'requested' : 'verify' );
		} else {
			finish( 'create' );
		}
	};
	const submitSetup = () => {
		if ( ! isMigration ) {
			const addressError = getFormatError( data.address || suggestedAddress );
			if ( addressError ) {
				setError( addressError );
				return;
			}
			if ( simulation?.managedSites.some( ( site ) => site.url === siteAddress ) ) {
				setError( __( 'That address is already in use. Try another site address.' ) );
				return;
			}
		}
		if ( ! isDevelopment && data.billing === 'client' ) {
			go( 'referral' );
		} else {
			completeSetup();
		}
	};
	const startDevelopment = () => {
		change( { journey: 'development', host: 'wpcom' } );
		if ( simulation ) {
			go( 'setup' );
		} else if ( ! isAgencyApproved( agency ) ) {
			setError( __( 'Your agency needs approval before creating a development site.' ) );
		} else if ( ! developmentLicenses.data ) {
			setError( __( 'Development site availability is still loading. Please try again.' ) );
		} else if ( ! developmentLicenses.data.available ) {
			setError(
				__(
					'Your free development sites are in use. You can create a production site with paid hosting.'
				)
			);
		} else {
			onSelectAction( 'dev-site-configurations' );
		}
	};

	let title = '';
	let description = '';
	let content: ReactNode;
	let primary: Action | undefined;
	let secondary: Action | undefined;

	switch ( step ) {
		case 'start':
			title = isFirstSite ? __( 'Add your first site' ) : __( 'Add a site' );
			description = isFirstSite
				? __(
						'Add one site or a whole batch. You can paste a list of addresses or upload a spreadsheet.'
					)
				: __( 'Connect a website you manage, move its hosting, or create something new.' );
			content = (
				<EntryChoices
					onConnect={ () => chooseJourney( 'connect', 'url' ) }
					onMove={ () => chooseJourney( 'migrate', 'source' ) }
					onCreate={ () => go( 'new' ) }
				/>
			);
			if ( entry === 'button' ) {
				// The hero carries its own heading, so the shared intro stays empty.
				title = '';
				content = (
					<div className="agency-site-wizard__hero">
						<div className="agency-site-wizard__hero-drawings" aria-hidden="true">
							<EntryIllustration kind="connect" />
							<EntryIllustration kind="move" />
							<EntryIllustration kind="create" />
						</div>
						<div className="agency-site-wizard__intro">
							<Heading level={ 2 } id={ titleId } tabIndex={ -1 }>
								{ __( 'Add your first site' ) }
							</Heading>
							<p>
								{ __( 'Bring in the WordPress sites you already manage, or start a new one.' ) }
							</p>
						</div>
						<Button
							className="agency-site-wizard__hero-cta"
							variant="primary"
							type="button"
							onClick={ () => go( 'choose' ) }
							__next40pxDefaultSize
						>
							{ __( 'Get started' ) }
						</Button>
					</div>
				);
			}
			if ( entry === 'address' ) {
				const listed = parseSiteList( data.intake ).sites.length;
				description = __( 'Add every site you manage, one by one or all at once.' );
				content = (
					<div className="agency-site-wizard__intake-layout">
						<SiteListInput
							value={ data.intake }
							onChange={ ( intake ) => change( { intake } ) }
							draft={ siteDraft }
							onDraftChange={ setSiteDraft }
							onError={ setError }
							error={ error }
							managed={ managedSites }
							simulate={ !! simulation }
							onContinue={ continueWithSites }
						/>
					</div>
				);
				primary = {
					label: listed
						? sprintf(
								/* translators: %d is the number of sites. */
								_n( 'Continue with %d site', 'Continue with %d sites', listed ),
								listed
							)
						: __( 'Continue' ),
					onClick: continueWithSites,
				};
			}
			break;
		case 'choose':
			title = __( 'How do you want to add your site?' );
			description = __(
				'Connect it where it’s hosted today, move it to new hosting, or create something new.'
			);
			content = (
				<EntryChoices
					onConnect={ () => chooseJourney( 'connect', 'url' ) }
					onMove={ () => chooseJourney( 'migrate', 'source' ) }
					onCreate={ () => go( 'new' ) }
				/>
			);
			break;
		case 'path':
			title = _n(
				'Where do you want this site hosted?',
				'Where do you want these sites hosted?',
				batchSize
			);
			description = _n(
				'Not sure yet? Keep it where it is. You can move it later.',
				'Not sure yet? Keep them where they are. You can move them later.',
				batchSize
			);
			content = (
				<div className="agency-site-wizard__choices agency-site-wizard__entry-options">
					<Choice
						illustration={ <EntryIllustration kind="connect" /> }
						title={ __( 'Keep current hosting' ) }
						description={ __( 'Connect with a small plugin. Nothing else changes.' ) }
						onClick={ () => chooseJourney( 'connect', 'authorize' ) }
					/>
					<Choice
						illustration={ <EntryIllustration kind="move" /> }
						title={ __( 'Move to our hosting' ) }
						description={ __( 'Move to WordPress.com or Pressable, with or without our help.' ) }
						onClick={ () => chooseJourney( 'migrate', 'host' ) }
					/>
				</div>
			);
			if ( batch.length ) {
				content = (
					<VStack spacing={ 10 }>
						{ content }
						<SiteSummary sites={ batch } />
					</VStack>
				);
			}
			break;
		case 'new':
			title = __( 'What kind of site are you creating?' );
			description = __( 'Not sure? Start with a development site. It’s free.' );
			content = (
				<VStack spacing={ 12 }>
					<CreateChoices
						onDevelopment={ startDevelopment }
						onHosted={ ( host ) => {
							change( { journey: 'hosted', undecided: false, host } );
							go( 'setup' );
						} }
					/>
					<CreateQuestions />
				</VStack>
			);
			break;
		case 'url':
		case 'source':
			title = isMigration ? __( 'Which sites are you moving?' ) : __( 'Bring your sites together' );
			description = isMigration
				? __(
						'Enter one site to get started, or paste a list and choose which sites to move together.'
					)
				: __( 'Add one WordPress site or your whole client portfolio.' );
			content = (
				<div className="agency-site-wizard__intake-layout">
					<SiteIntake
						describedBy={ titleId }
						value={ data.intake }
						onChange={ ( intake ) => change( { intake } ) }
						onReview={ reviewSites }
						onError={ setError }
						error={ error }
						onChooseAccount={
							! isMigration
								? () => ( simulation ? go( 'picker' ) : onSelectAction( 'import-from-wpcom' ) )
								: undefined
						}
					/>
				</div>
			);
			primary = { label: __( 'Continue' ), onClick: () => reviewSites( data.intake ) };
			break;
		case 'review':
			title = isMigration
				? __( 'Choose which sites to move' )
				: __( 'Choose which sites to connect' );
			description = isMigration
				? __( 'Uncheck any sites you don’t want to move yet. You’ll choose hosting next.' )
				: __( 'Uncheck any sites you don’t want to connect yet.' );
			if ( data.undecided ) {
				title = __( 'Choose which sites to add' );
				description = __(
					'Uncheck any sites you don’t want to add yet. Next, you’ll choose to keep their hosting or move them.'
				);
			}
			if ( data.sites.length > SITE_REVIEW_BULK_THRESHOLD ) {
				description = __(
					'Choose a first batch to work on together. You can return for the rest.'
				);
			}
			content = (
				<SiteReview
					simulate={ !! simulation }
					sites={ data.sites }
					chosen={ data.chosen }
					completed={ data.completed }
					duplicates={ data.duplicates }
					managed={
						isMigration ? [] : ( simulation?.managedSites.map( ( site ) => site.url ) ?? [] )
					}
					onChange={ ( chosen ) => change( { chosen } ) }
				/>
			);
			primary = { label: selectedSiteLabel( batch.length ), onClick: continueReview };
			break;
		case 'picker':
			title = __( 'Add sites to your agency' );
			description = __(
				'These sites are linked to your WordPress.com account but aren’t in your agency dashboard yet. Choose which ones to add.'
			);
			content = (
				<div className="agency-site-wizard__form">
					<div className="agency-site-wizard__panel">
						{ simulation?.import.sites.length ? (
							simulation.import.sites.map( ( site ) => (
								<CheckboxControl
									key={ site.ID }
									__nextHasNoMarginBottom
									label={ site.name || site.URL }
									help={ <bdi>{ site.URL }</bdi> }
									checked={ data.selected.includes( site.ID ) }
									onChange={ ( checked ) =>
										change( {
											selected: checked
												? [ ...data.selected, site.ID ]
												: data.selected.filter( ( id ) => id !== site.ID ),
										} )
									}
								/>
							) )
						) : (
							<p>
								{ __(
									'All available sites on this account are already connected. Go back to connect a different website by its address.'
								) }
							</p>
						) }
					</div>
				</div>
			);
			primary = {
				label: __( 'Add selected sites' ),
				onClick: () =>
					data.selected.length
						? finish( 'picker' )
						: setError( __( 'Select at least one site to continue.' ) ),
			};
			break;
		case 'authorize': {
			if ( knownSite && batchSize === 1 ) {
				title = __( 'Add this site to your dashboard' );
				description = __( 'This site is already linked to your account. No plugin setup needed.' );
				content = (
					<div className="agency-site-wizard__connection">
						<ConnectionSites sites={ batch } knownSite={ knownSite } simulate={ !! simulation } />
					</div>
				);
				primary = {
					label: __( 'Add to dashboard' ),
					onClick: () => finish( 'connect' ),
				};
				break;
			}
			title = _n(
				'Install a plugin to connect your site',
				'Install a plugin to connect your sites',
				batchSize
			);
			description = _n(
				'Pick either plugin to connect your site. Already using Jetpack? Use that.',
				'Each site can use either plugin. Already using Jetpack? Use that.',
				batchSize
			);
			content = <ConnectionInstall sites={ batch } simulate={ !! simulation } />;
			primary = simulation
				? {
						label: __( 'Continue' ),
						onClick: () => {
							go( 'checking' );
							checkConnections( () => change( { connectionChecks: 1 } ) );
						},
					}
				: { label: __( 'View sites' ), onClick: onClose };
			break;
		}
		case 'checking': {
			if ( isChecking ) {
				title = _n( 'Checking your site…', 'Checking your sites…', batchSize );
				description = __( 'Looking for the plugin and your approval. This takes a moment.' );
				content = (
					<div className="agency-site-wizard__checking">
						<Spinner />
					</div>
				);
				break;
			}
			// The preview fails a few sites on the first check, so the retry state can be reviewed.
			const notConnected =
				batch.length > 1 ? batch.filter( ( site, index ) => index % 3 === 1 ) : batch;
			title = sprintf(
				/* translators: %d is the number of sites. */
				_n( '%d site isn’t connected yet', '%d sites aren’t connected yet', notConnected.length ),
				notConnected.length
			);
			description =
				notConnected.length < batch.length
					? __( 'The rest are connected. Fix these, then check again.' )
					: _n(
							'Here’s what we found. Fix it, then check again.',
							'Here’s what we found. Fix these, then check again.',
							notConnected.length
						);
			// The preview gives each failed site a different reason, so every fix can be reviewed.
			const reasonOf = ( site: IntakeSite ) =>
				( [ 'missing', 'unapproved', 'unreachable' ] as const )[ notConnected.indexOf( site ) % 3 ];
			content = (
				<VStack spacing={ 10 }>
					<ConnectionSiteList
						sites={ notConnected }
						simulate={ !! simulation }
						showInstallers
						heading={ __( 'Needs attention' ) }
						describe={ ( site ) =>
							( {
								missing: __( 'Plugin not found' ),
								unapproved: __( 'Connection not approved' ),
								unreachable: __( 'Couldn’t reach the site' ),
							} )[ reasonOf( site ) ]
						}
						renderAction={ ( site ) => {
							const reason = reasonOf( site );
							if ( reason === 'missing' ) {
								return <PluginInstallMenu site={ site } />;
							}
							return (
								<Button
									__next40pxDefaultSize
									variant="tertiary"
									href={
										reason === 'unapproved'
											? `${ site.url.replace( /\/$/, '' ) }/wp-admin/plugins.php`
											: site.url
									}
									target="_blank"
									rel="noreferrer"
								>
									{ reason === 'unapproved' ? __( 'Approve in WordPress' ) : __( 'Visit site' ) }
								</Button>
							);
						} }
					/>
					<ConnectionTroubleshooting sites={ notConnected } />
				</VStack>
			);
			primary = {
				label: __( 'Check again' ),
				onClick: () => checkConnections( () => finish( 'connect' ) ),
			};
			break;
		}
		case 'host': {
			title = __( 'Choose your hosting' );
			description = isMigration
				? _n(
						'Compare what each includes and what it costs for this site.',
						'Compare what each includes and what it costs for these sites.',
						batchSize
					)
				: __( 'Compare what each includes and what it costs.' );
			content = (
				<VStack spacing={ 8 }>
					<div className="agency-site-wizard__hosting-grid">
						{ ( [ 'wpcom', 'pressable' ] as const ).map( ( host ) => (
							<HostingChoice
								key={ host }
								host={ host }
								sites={ hostingCount }
								estimate={ hosting.estimates[ host ] }
								room={ host === 'pressable' ? hosting.pitch?.room : undefined }
								isLoading={ hosting.isLoading }
								onClick={ () => {
									change( { host } );
									go( isMigration ? 'method' : 'setup' );
								} }
							/>
						) ) }
					</div>
					{ isMigration && batch.length > 0 && <SiteSummary sites={ batch } /> }
					{ hosting.pitch && <PressablePitchNote pitch={ hosting.pitch } /> }
				</VStack>
			);
			break;
		}
		case 'method':
			title = _n( 'How do you want to move it?', 'How do you want to move them?', batchSize );
			description = __( 'Moving is free either way. Your sites stay live until you switch them.' );
			content = (
				<VStack spacing={ 8 }>
					<div className="agency-site-wizard__choices agency-site-wizard__entry-options">
						<Choice
							illustration={ <BellIllustration /> }
							title={ __( 'Request a migration' ) }
							description={ __( 'Our team moves them for you, usually within a week.' ) }
							features={ [
								__( 'Concierge, start to finish' ),
								__( 'We review each site first' ),
								__( 'You approve before switching' ),
							] }
							onClick={ () => {
								change( { method: 'concierge' } );
								go( 'setup' );
							} }
						/>
						<Choice
							illustration={ <EntryIllustration kind="move" /> }
							title={ __( 'Move them myself' ) }
							description={ __( 'Use our tools and guide, on your own schedule.' ) }
							features={ [
								__( 'Step-by-step guide' ),
								__( 'A plugin copies everything' ),
								__( 'Help if you get stuck' ),
							] }
							onClick={ () => {
								change( { method: 'self' } );
								go( 'setup' );
							} }
						/>
					</div>
					<MoveQuestions />
				</VStack>
			);
			break;
		case 'setup': {
			const isConcierge = isMigration && data.method === 'concierge';
			title = __( 'Set up your site' );
			description = sprintf(
				/* translators: %s is the hosting provider. */
				__( 'It’ll be hosted on %s.' ),
				hostName
			);
			if ( isDevelopment ) {
				title = __( 'Set up your development site' );
				description = __( 'It’s free while you build. Add hosting when you launch.' );
			} else if ( isConcierge ) {
				title = __( 'Request your migration' );
				description = __( 'Our team gets your request and contacts you to plan the move.' );
			} else if ( isMigration ) {
				title = __( 'Set up hosting for your move' );
				description = __( 'Next, you’ll get a step-by-step guide for moving each site.' );
			}
			if ( ! simulation ) {
				content = (
					<div className="agency-site-wizard__form">
						<div className="agency-site-wizard__panel">
							<Heading level={ 3 }>{ __( 'My agency pays' ) }</Heading>
							<p>
								{ __(
									'Purchase hosting through your agency account. Your agency receives the bill and can include the cost in what it charges the client.'
								) }
							</p>
							<Heading level={ 3 }>{ __( 'My client pays' ) }</Heading>
							<p>
								{ __(
									'Choose a plan in the Marketplace and send a referral. Your client pays for hosting directly, while you manage their website.'
								) }
							</p>
							<p>
								{ __(
									'If you already purchased hosting, use that plan from Purchases instead of buying again.'
								) }
							</p>
						</div>
						{ isMigration && (
							<Button
								__next40pxDefaultSize
								variant="link"
								href={
									data.method === 'concierge'
										? 'https://agencies.automattic.com/overview#contact-support-migration-offer'
										: 'https://agencieshelp.automattic.com/knowledge-base/migrations/'
								}
								target="_blank"
								rel="noreferrer"
							>
								{ data.method === 'concierge'
									? __( 'Hosting ready? Request a migration' )
									: __( 'Hosting ready? Open migration instructions' ) }
							</Button>
						) }
					</div>
				);
				primary = {
					label: __( 'Choose a plan' ),
					href: getMarketplaceHostingSectionRoute( data.host ),
				};
				secondary = {
					label: __( 'Use a plan I own' ),
					href:
						data.host === 'wpcom'
							? '/purchases?status=unassigned&search=WordPress.com'
							: 'https://my.pressable.com/agency/auth',
				};
				break;
			}
			const estimate = hosting.estimates[ data.host ];
			const cost = estimate
				? sprintf(
						/* translators: 1: A monthly price. 2: The number of sites. */
						_n( 'About %1$s/mo for %2$d site.', 'About %1$s/mo for %2$d sites.', hostingCount ),
						estimate.total,
						hostingCount
					)
				: '';
			content = (
				<VStack spacing={ 8 }>
					{ ! isMigration && (
						<Section title={ isDevelopment ? undefined : __( 'Site details' ) }>
							<VStack spacing={ 4 }>
								<TextControl
									label={ __( 'Site name' ) }
									value={ data.name }
									onChange={ ( name ) => change( { name } ) }
									placeholder={ __( 'Client website' ) }
									__next40pxDefaultSize
									__nextHasNoMarginBottom
								/>
								<SuffixInputControl
									label={ __( 'Site address' ) }
									value={ data.address }
									placeholder={ suggestedAddress }
									suffix={ addressSuffix }
									onChange={ ( address?: string ) =>
										change( { address: ( address ?? '' ).toLowerCase() } )
									}
									help={ __( 'Temporary. Connect your client’s domain when you launch.' ) }
									spellCheck="false"
									__next40pxDefaultSize
								/>
								<SelectControl
									label={ __( 'PHP version' ) }
									value={ data.phpVersion || phpVersions.recommendedValue }
									options={ phpVersions.phpVersions.filter( ( version ) => ! version.disabled ) }
									onChange={ ( phpVersion ) => change( { phpVersion } ) }
									__next40pxDefaultSize
									__nextHasNoMarginBottom
								/>
								<SelectControl
									label={ __( 'Primary data center' ) }
									value={ data.dataCenter }
									options={ [
										{ value: '', label: __( 'No preference' ) },
										...Object.entries( getDataCenterOptions() ).map( ( [ value, label ] ) => ( {
											value,
											label,
										} ) ),
									] }
									onChange={ ( dataCenter ) => change( { dataCenter } ) }
									__next40pxDefaultSize
									__nextHasNoMarginBottom
								/>
							</VStack>
						</Section>
					) }
					{ ! isDevelopment && (
						<Section title={ __( 'Who pays for hosting?' ) } description={ cost || undefined }>
							<VStack spacing={ 3 } role="radiogroup" aria-label={ __( 'Who pays for hosting?' ) }>
								<RadioChoice
									title={
										data.host === 'wpcom'
											? __( 'Use my unused WordPress.com plan' )
											: __( 'Add to my existing Pressable plan' )
									}
									description={
										isMigration && batchSize > 1
											? __(
													'It has room for one more site. The others in this batch still need a plan.'
												)
											: __( 'It has room for one more site.' )
									}
									name="payer"
									value="existing"
									checked={ data.billing === 'existing' }
									onChange={ () => change( { billing: 'existing' } ) }
								/>
								<RadioChoice
									title={ __( 'My agency pays' ) }
									description={ __( 'You get the bill and charge your client however you like.' ) }
									name="payer"
									value="agency"
									checked={ data.billing === 'agency' }
									onChange={ () => change( { billing: 'agency' } ) }
								/>
								<RadioChoice
									title={ __( 'My client pays' ) }
									description={ __(
										'We email your client a link to buy it. They get the bill, you manage the sites.'
									) }
									name="payer"
									value="client"
									checked={ data.billing === 'client' }
									onChange={ () => change( { billing: 'client' } ) }
								/>
							</VStack>
						</Section>
					) }
					{ isConcierge && (
						<Section
							title={ __( 'Notes for our team' ) }
							description={ __(
								'Optional. Timing, stores that need a quiet window, or sites to move first.'
							) }
						>
							<TextareaControl
								label={ __( 'Notes for our team' ) }
								hideLabelFromVision
								value={ data.message }
								onChange={ ( message ) => change( { message } ) }
								__nextHasNoMarginBottom
							/>
						</Section>
					) }
					{ isMigration && (
						<SiteSummary
							sites={ batch }
							heading={ sprintf(
								/* translators: 1: The number of sites. 2: The hosting provider. */
								_n( 'Moving %1$d site to %2$s', 'Moving %1$d sites to %2$s', batchSize ),
								batchSize,
								hostName
							) }
						/>
					) }
				</VStack>
			);
			primary = { label: __( 'Create site' ), onClick: submitSetup };
			if ( isMigration ) {
				primary.label = isConcierge ? __( 'Send migration request' ) : __( 'Start moving' );
			}
			if ( ! isDevelopment && data.billing === 'client' ) {
				primary.label = __( 'Continue' );
			}
			break;
		}
		case 'referral':
			title = __( 'Send your client the bill' );
			description = __(
				'We’ll email them a link to buy hosting. Here’s exactly what they’ll get.'
			);
			content = (
				<VStack spacing={ 8 }>
					<TextControl
						label={ __( 'Client email' ) }
						type="email"
						autoComplete="email"
						dir="ltr"
						value={ data.email }
						onChange={ ( email ) => {
							change( { email } );
							setError( '' );
						} }
						help={
							isMigration && batchSize > 1
								? __( 'This client pays for every site in this batch.' )
								: undefined
						}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					<ReferralPreview
						email={ data.email }
						agencyName={ agency?.name }
						hostName={ hostName }
						total={ hosting.estimates[ data.host ]?.total }
						sites={
							isMigration
								? batch.map( ( site ) => site.url.replace( /^https?:\/\//, '' ) )
								: [ siteAddress ]
						}
						isMigration={ isMigration }
					/>
				</VStack>
			);
			primary = {
				label: __( 'Send referral' ),
				onClick: () => {
					if ( ! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test( data.email.trim() ) ) {
						setError( __( 'Enter your client’s email address.' ) );
						return;
					}
					go( 'referral-sent' );
				},
			};
			break;
		case 'referral-sent':
			title = __( 'Your referral is on its way' );
			description = sprintf(
				/* translators: %s is an email address. */
				__( 'We emailed %s a link to buy hosting. You can leave this page.' ),
				data.email
			);
			content = (
				<VStack spacing={ 8 }>
					<Section title={ __( 'What happens next' ) }>
						<NumberedSteps
							items={ [
								{
									title: __( 'Your client buys hosting' ),
									description: sprintf(
										/* translators: %s is the hosting provider. */
										__( 'They pay %s directly. The bill goes to them, not you.' ),
										hostName
									),
								},
								{
									title: __( 'We let you know' ),
									description: __( 'You get an email as soon as they’ve paid.' ),
								},
								{
									title: isMigration ? __( 'Your move continues' ) : __( 'Your site is created' ),
									description: isMigration
										? __( 'Pick up where you left off, right here.' )
										: __( 'It shows up in your Sites list, ready to build.' ),
								},
							] }
						/>
					</Section>
					<SupportHelp
						title={ __( 'Client has questions?' ) }
						description={ __( 'We can help with plans and billing.' ) }
						chatMessage={ sprintf(
							/* translators: %s is an email address. */
							__( 'I sent a hosting referral to %s and have a question about it.' ),
							data.email
						) }
					/>
				</VStack>
			);
			primary = { label: __( 'Back to sites' ), onClick: onClose };
			secondary = { label: __( 'Check purchase status' ), onClick: completeSetup };
			break;
		case 'requested':
			title = __( 'Your migration request is in' );
			description = __(
				'Our migration team will email you to plan the move. You can leave this page.'
			);
			content = (
				<VStack spacing={ 8 }>
					<Section title={ __( 'What happens next' ) }>
						<NumberedSteps
							items={ [
								{
									title: __( 'We contact you' ),
									description: __( 'To agree on timing and how to share access securely.' ),
								},
								{
									title: _n( 'We copy your site', 'We copy your sites', batchSize ),
									description:
										batchSize > 10
											? __( 'In groups, on a schedule you agree to. Originals stay live.' )
											: __( 'Usually within a week. Originals stay live.' ),
								},
								{
									title: __( 'You review and switch' ),
									description: __( 'Check each copy, then approve its domain switch.' ),
								},
							] }
						/>
					</Section>
					<SiteSummary
						sites={ batch }
						heading={ sprintf(
							/* translators: %d is the number of sites. */
							_n( '%d site in this request', '%d sites in this request', batchSize ),
							batchSize
						) }
					/>
					<CallHelp
						title={ __( 'Planning a large move?' ) }
						description={ __( 'Talk it through with your partner team.' ) }
					/>
				</VStack>
			);
			primary = { label: __( 'Back to sites' ), onClick: onClose };
			secondary = { label: __( 'Check migration status' ), onClick: () => go( 'verify' ) };
			break;
		case 'verify':
			title = sprintf(
				/* translators: %s is the hosting provider. */
				__( 'Welcome to %s' ),
				hostName
			);
			description = _n(
				'Your copy is ready. Check it, then switch the domain.',
				'Your copies are ready. Check each one, then switch the domains.',
				batchSize
			);
			content = (
				<VStack spacing={ 8 }>
					<SiteListSummary
						sites={ batch }
						simulate={ !! simulation }
						heading={ _n( 'Review your copy', 'Review your copies', batchSize ) }
						renderAction={ ( site ) => (
							<Button
								variant="tertiary"
								href={ site.url }
								target="_blank"
								rel="noreferrer"
								__next40pxDefaultSize
							>
								{ __( 'Open copy' ) }
							</Button>
						) }
					/>
					<Section
						title={ sprintf(
							/* translators: %s is the hosting provider. */
							__( 'Included with %s' ),
							hostName
						) }
					>
						<HostingFeatures host={ data.host } />
					</Section>
				</VStack>
			);
			primary = {
				label:
					batchSize > 1
						? sprintf(
								/* translators: %d is the number of sites. */
								__( 'Switch %d domains' ),
								batchSize
							)
						: __( 'Switch domain' ),
				onClick: () => finish( 'migrate' ),
			};
			break;
		case 'success':
			title = result || __( 'Your sites are ready' );
			if ( ! result && isDevelopment ) {
				title = __( 'Your development site is ready' );
			}
			description = __(
				'Your site has been added to your dashboard. You’re ready to start building.'
			);
			if ( data.journey === 'connect' ) {
				description = _n(
					'It’s in your Sites list now.',
					'They’re in your Sites list now.',
					batchSize
				);
				content = (
					<ActionList title={ __( 'Next steps' ) }>
						<ActionList.ActionItem
							title={ __( 'Invite your team' ) }
							description={ __( 'Give teammates access to manage these sites.' ) }
							decoration={ <Icon icon={ people } /> }
							actions={
								<RouterLinkButton
									to={ TEAM_ROUTE }
									variant="secondary"
									size="compact"
									__next40pxDefaultSize
								>
									{ __( 'Invite' ) }
								</RouterLinkButton>
							}
						/>
						<ActionList.ActionItem
							title={ __( 'Add security and backups' ) }
							description={ __(
								'Protect these sites with Jetpack products from the marketplace.'
							) }
							decoration={ <Icon icon={ shield } /> }
							actions={
								<RouterLinkButton
									to={ MARKETPLACE_PRODUCTS_ROUTE }
									variant="secondary"
									size="compact"
									__next40pxDefaultSize
								>
									{ __( 'Browse products' ) }
								</RouterLinkButton>
							}
						/>
						<ActionList.ActionItem
							title={ __( 'Move a site to new hosting' ) }
							description={ __( 'When you’re ready, move a site to WordPress.com or Pressable.' ) }
							decoration={ <Icon icon={ reusableBlock } /> }
							actions={
								<Button
									variant="secondary"
									size="compact"
									onClick={ () => chooseJourney( 'migrate', 'source' ) }
									__next40pxDefaultSize
								>
									{ __( 'Move a site' ) }
								</Button>
							}
						/>
					</ActionList>
				);
			}
			if ( isMigration ) {
				description = __(
					'Your website is on its new hosting and appears in your Sites dashboard.'
				);
			}
			primary = { label: __( 'View sites' ), onClick: onClose };
			secondary = data.sites.some( ( site ) => ! data.completed.includes( site.id ) )
				? {
						label: __( 'Continue with remaining sites' ),
						onClick: () => {
							change( { chosen: [] } );
							go( 'review' );
						},
					}
				: { label: __( 'Add another site' ), onClick: restart };
	}

	const canGoBack = ! [ 'start', 'success', 'requested', 'referral-sent', 'verify' ].includes(
		step
	);
	return (
		<div
			className="agency-site-wizard"
			data-step={ step }
			data-entry={ entry }
			data-busy={ step === 'checking' && isChecking ? true : undefined }
		>
			<Card className="agency-site-wizard__workspace">
				<AmplifyBackdrop />
				<div className="agency-site-wizard__navigation">
					{ canGoBack && (
						<Button
							className="agency-site-wizard__back agency-site-wizard__directional-button"
							variant="tertiary"
							type="button"
							icon={ isRTL() ? chevronRight : chevronLeft }
							onClick={ back }
							__next40pxDefaultSize
						>
							{ __( 'Back' ) }
						</Button>
					) }
				</div>
				<form
					className="agency-site-wizard__frame"
					noValidate
					onSubmit={ ( event ) => {
						event.preventDefault();
						primary?.onClick?.();
					} }
				>
					<div className="agency-site-wizard__body" ref={ container }>
						{ title && (
							<div className="agency-site-wizard__intro">
								<Heading level={ 2 } id={ titleId } tabIndex={ -1 }>
									{ title }
								</Heading>
								{ description && <p>{ description }</p> }
							</div>
						) }
						<div className="agency-site-wizard__step-content">
							{ content }
							{ ! hasFieldError && (
								<p className="agency-site-wizard__error" role="alert">
									{ error }
								</p>
							) }
							{ ! isUrlStep && ( primary || secondary ) && (
								<div className="agency-site-wizard__actions">
									{ primary && (
										<Button
											variant="primary"
											__next40pxDefaultSize
											type={ primary.href ? 'button' : 'submit' }
											href={ primary.href }
											target={ primary.external ? '_blank' : undefined }
											rel={ primary.external ? 'noreferrer' : undefined }
										>
											{ primary.label }
										</Button>
									) }
									{ secondary && (
										<Button
											__next40pxDefaultSize
											variant="link"
											type="button"
											href={ secondary.href }
											onClick={ secondary.onClick }
										>
											{ secondary.label }
										</Button>
									) }
								</div>
							) }
						</div>
					</div>
				</form>
				{ isFirstSite && step === 'start' && <SitesOverviewStory /> }
			</Card>
		</div>
	);
}
