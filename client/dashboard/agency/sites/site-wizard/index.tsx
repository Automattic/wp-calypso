import { activeAgencyQuery, agencyDevLicensesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	Button,
	CheckboxControl,
	TextareaControl,
	TextControl,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { chevronLeft } from '@wordpress/icons';
import { useEffect, useId, useRef } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { Card } from '../../../components/card';
import { consumeWizardJump, setWizardPosition, useDesignPreview } from '../../design-preview';
import { getMarketplaceHostingSectionRoute } from '../../marketplace/paths';
import { getFormatError } from '../../marketplace/purchases/use-site-address';
import { isAgencyApproved, parseSiteUrl } from '../add-new-site/lib';
import AmplifyBackdrop from './amplify-backdrop';
import { Choice, RadioChoice } from './choices';
import ConnectionSetup, { ConnectionInstructions, ConnectionSites } from './connection-setup';
import ConnectionWaiting from './connection-waiting';
import CreateChoices from './create-choices';
import EntryChoices from './entry-choices';
import HostedShowcase from './hosted-showcase';
import HostingChoice from './hosting-choice';
import SitesOverviewStory from './overview-story';
import { parseSiteList, SITE_REVIEW_BULK_THRESHOLD } from './site-intake';
import SiteIntake, { selectedSiteLabel } from './site-intake-form';
import SitePreview from './site-preview';
import SiteReview from './site-review';
import useSiteWizard from './use-site-wizard';
import type { Journey, Step } from './use-site-wizard';
import type useSiteSimulation from '../../design-preview/use-site-simulation';
import type { AddNewSiteAction } from '../add-new-site/types';
import type { ReactNode } from 'react';
import './style.scss';

interface Props {
	simulation?: ReturnType< typeof useSiteSimulation >;
	onStart: () => void;
	onClose: () => void;
	onSelectAction: ( action: AddNewSiteAction ) => void;
	isFirstSite: boolean;
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
	onSelectAction,
	isFirstSite,
}: Props ) {
	const { recordTracksEvent } = useAnalytics();
	const { wizardJump, sitesRevision } = useDesignPreview();
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
	const isUrlStep = step === 'url' || step === 'source';
	const previousStep = useRef( step );
	useEffect( () => {
		if ( previousStep.current !== step ) {
			const target = isUrlStep ? '.agency-site-wizard__url-input textarea' : 'h2';
			container.current?.querySelector< HTMLElement >( target )?.focus();
			previousStep.current = step;
		}
	}, [ step, isUrlStep ] );
	const go = ( next: Step ) => {
		recordTracksEvent( 'calypso_a4a_site_wizard_step', { step: next, preview: !! simulation } );
		changeStep( next );
	};
	const chooseJourney = ( journey: Journey, next: Step ) => {
		change( { journey } );
		go( next );
	};
	const hostName = data.host === 'wpcom' ? 'WordPress.com' : 'Pressable';
	const source = parseSiteUrl( data.url );
	const knownSite = simulation?.import.sites.find(
		( site ) => parseSiteUrl( site.URL )?.host === source?.host
	);
	const isMigration = data.journey === 'migrate';
	const isDevelopment = data.journey === 'development';
	const siteAddress = `${ data.address }.${ data.host === 'wpcom' ? 'wpcomstaging.com' : 'mystagingwebsite.com' }`;
	const reviewSites = ( input: string ) => {
		const { sites, duplicates } = parseSiteList( input );
		if ( ! sites.length ) {
			setError(
				__(
					'We couldn’t find any website addresses. Try example.com, or paste the address column from your spreadsheet.'
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
		} );
		const nextStep = isMigration ? 'host' : 'authorize';
		go( sites.length === 1 ? nextStep : 'review' );
	};
	const batch = data.sites.filter( ( site ) => data.chosen.includes( site.id ) );
	const batchSize = Math.max( 1, batch.length );
	const batchNames =
		batch.length > 1
			? sprintf(
					/* translators: %d is the number of sites. */
					__( '%d selected sites' ),
					batch.length
				)
			: source?.host;
	const continueReview = () => {
		if ( ! batch.length ) {
			setError( __( 'Select at least one site to continue.' ) );
			return;
		}
		change( { url: batch[ 0 ].url } );
		go( isMigration ? 'host' : 'authorize' );
	};
	const finish = ( kind: 'connect' | 'picker' | 'create' | 'migrate', ids = data.selected ) => {
		if ( ! simulation ) {
			return;
		}
		if ( kind === 'picker' ) {
			simulation.import.onImport( ids );
			setResult(
				sprintf(
					/* translators: %d is the number of connected sites. */
					_n( '%d site connected', '%d sites connected', ids.length ),
					ids.length
				)
			);
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
			setResult(
				batchSize === 1
					? __( 'Your site is connected' )
					: sprintf(
							/* translators: %d is the number of sites. */
							__( '%d sites connected' ),
							batchSize
						)
			);
		} else {
			if ( kind === 'migrate' ) {
				for ( const site of batch ) {
					simulation.onCreateHosted( site.url, site.name, data.host );
				}
			} else {
				simulation.onCreateHosted( siteAddress, data.name, data.host, isDevelopment );
			}
			let completion: string = __( 'Your new site is ready' );
			if ( isDevelopment ) {
				completion = __( 'Your development site is ready' );
			}
			if ( kind === 'migrate' ) {
				completion =
					batchSize === 1
						? __( 'Your migration is complete' )
						: sprintf(
								/* translators: %d is the number of sites. */
								__( '%d sites moved' ),
								batchSize
							);
			}
			setResult( completion );
		}
		if ( kind === 'connect' || kind === 'migrate' ) {
			change( { completed: [ ...new Set( [ ...data.completed, ...data.chosen ] ) ] } );
		}
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
			const addressError = getFormatError( data.address );
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
			if ( ! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test( data.email.trim() ) ) {
				setError( __( 'Enter your client’s email address.' ) );
				return;
			}
			go( 'referral-sent' );
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
			break;
		case 'new':
			title = __( 'What kind of site are you creating?' );
			description = __(
				'Choose whether you’re building a project or setting up a website for visitors.'
			);
			content = (
				<CreateChoices
					onDevelopment={ startDevelopment }
					onProduction={ () => chooseJourney( 'hosted', 'host' ) }
				/>
			);
			break;
		case 'url':
		case 'source':
			title = isMigration ? __( 'Which sites are you moving?' ) : __( 'Bring your sites together' );
			description = isMigration
				? __(
						'Enter one site to get started, or paste a list and choose which sites to move together.'
					)
				: __(
						'Add one WordPress site or your whole client portfolio. Keep the hosting you already have.'
					);
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
				: __( 'Uncheck any sites you don’t want to connect yet. Their hosting stays the same.' );
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
				'These sites are linked to your WordPress.com account but aren’t in your agency dashboard yet. Choose which ones to add. Their hosting stays the same.'
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
			const alreadyLinked = !! knownSite && batchSize === 1;
			title =
				batchSize > 1
					? __( 'Install the plugin on each site' )
					: __( 'Install the plugin to connect' );
			if ( alreadyLinked ) {
				title = __( 'Add this site to your dashboard' );
			}
			description = alreadyLinked
				? __( 'This site is already linked to your account. No plugin setup needed.' )
				: _n(
						'Your website and hosting stay where they are.',
						'Your websites and hosting stay where they are.',
						batchSize
					);
			content = (
				<ConnectionSetup
					sites={ batch }
					knownSite={ alreadyLinked ? knownSite : undefined }
					plugin={ data.plugin }
					onPluginSelect={ ( plugin ) => {
						change( { plugin, connectionChecks: 0 } );
						if ( simulation || batchSize > 1 ) {
							go( 'connecting' );
						}
					} }
					simulate={ !! simulation }
				/>
			);
			if ( alreadyLinked ) {
				primary = {
					label: __( 'Add to dashboard' ),
					onClick: () => finish( 'connect' ),
				};
			}
			break;
		}
		case 'connecting':
			title = _n(
				'Waiting for your site to connect',
				'Waiting for your sites to connect',
				batchSize
			);
			description = __( 'Finish setup in WordPress, then return here to check the connection.' );
			if ( ! simulation ) {
				title = __( 'Connect each site' );
				description = __(
					'Open each installer and approve the connection to your agency account.'
				);
				content = (
					<div className="agency-site-wizard__connection">
						<ConnectionSites
							sites={ batch }
							plugin={ data.plugin }
							simulate={ false }
							showInstallers
						/>
						<div className="agency-site-wizard__connection-setup">
							<ConnectionInstructions plugin={ data.plugin } />
						</div>
					</div>
				);
				secondary = { label: __( 'View sites' ), onClick: onClose };
				break;
			}
			content = (
				<ConnectionWaiting
					sites={ batch }
					plugin={ data.plugin }
					hasChecked={ data.connectionChecks > 0 }
					onCheck={ () => {
						// Preview the retry state first, then a successful return from the installer.
						if ( data.connectionChecks === 0 ) {
							change( { connectionChecks: 1 } );
						} else {
							finish( 'connect' );
						}
					} }
				/>
			);
			break;
		case 'host':
			title = __( 'Choose your hosting' );
			description = __(
				'Choose a provider to continue. You’ll choose a plan and arrange payment later.'
			);
			content = (
				<div className="agency-site-wizard__choices agency-site-wizard__entry-options">
					<HostingChoice
						host="wpcom"
						onClick={ () => {
							change( { host: 'wpcom' } );
							go( isMigration ? 'method' : 'setup' );
						} }
					/>
					<HostingChoice
						host="pressable"
						onClick={ () => {
							change( { host: 'pressable' } );
							go( isMigration ? 'method' : 'setup' );
						} }
					/>
				</div>
			);
			break;
		case 'method':
			title = __( 'Who should handle the move?' );
			description = __( 'Either way, you’ll review the copied site before switching your domain.' );
			content = (
				<div className="agency-site-wizard__choices">
					<Choice
						title={ __( 'Move it for me' ) }
						description={ __( 'Our team copies the site and coordinates the move with you.' ) }
						onClick={ () => {
							change( { method: 'concierge' } );
							go( 'setup' );
						} }
					/>
					<Choice
						title={ __( 'I’ll move it myself' ) }
						description={ __(
							'Use the migration tools to copy the site, check it, and connect your domain.'
						) }
						onClick={ () => {
							change( { method: 'self' } );
							go( 'setup' );
						} }
					/>
				</div>
			);
			break;
		case 'setup':
			title = isMigration ? __( 'Arrange your migration' ) : __( 'Set up your site' );
			description = isDevelopment
				? __( 'Build on WordPress.com at no cost. A paid hosting plan is needed when you launch.' )
				: sprintf(
						/* translators: %s is the hosting provider. */
						_n(
							'Your website will be hosted on %s. Choose who pays for the hosting below.',
							'Your websites will be hosted on %s. Choose who pays for the hosting below.',
							isMigration ? batchSize : 1
						),
						hostName
					);
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
			content = (
				<div className="agency-site-wizard__sections">
					{ ! isMigration && (
						<div className="agency-site-wizard__form">
							<TextControl
								label={ __( 'Site name' ) }
								value={ data.name }
								onChange={ ( name ) => change( { name } ) }
								placeholder={ __( 'Client website' ) }
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							/>
							<TextControl
								label={ __( 'Site address' ) }
								value={ data.address }
								onChange={ ( address ) => change( { address: address.toLowerCase() } ) }
								help={
									<span>
										<bdi>{ siteAddress }</bdi> { __( 'You can connect a custom domain later.' ) }
									</span>
								}
								dir="ltr"
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							/>
						</div>
					) }
					{ isMigration && (
						<p>
							<bdi>{ batchNames }</bdi>
							{ ' → ' }
							{ hostName }
						</p>
					) }
					{ ! isDevelopment && (
						<>
							<div className="agency-site-wizard__panel agency-site-wizard__owned-plan">
								<Heading level={ 3 }>{ __( 'Already on your agency account' ) }</Heading>
								<CheckboxControl
									__nextHasNoMarginBottom
									label={
										data.host === 'wpcom'
											? __( 'Use my unused WordPress.com plan' )
											: __( 'Add this website to my existing Pressable plan' )
									}
									help={ __(
										'Your agency already has hosting for one more website. Use it first; any additional sites in this batch need paid hosting.'
									) }
									checked={ data.billing === 'existing' }
									onChange={ ( checked ) => change( { billing: checked ? 'existing' : 'agency' } ) }
								/>
							</div>
							{ data.billing !== 'existing' && (
								<fieldset className="agency-site-wizard__fieldset">
									<legend>{ __( 'Who will pay for the new hosting plan?' ) }</legend>
									<div className="agency-site-wizard__choices">
										<RadioChoice
											title={ __( 'My agency pays' ) }
											description={ __(
												'Your agency purchases the hosting and receives the bill. You decide how to charge your client for it, such as including it in a maintenance package.'
											) }
											name="payer"
											value="agency"
											checked={ data.billing === 'agency' }
											onChange={ () => change( { billing: 'agency' } ) }
										/>
										<RadioChoice
											title={ __( 'My client pays' ) }
											description={ __(
												'Send your client a referral to purchase hosting directly. They receive the hosting bill, and you can manage their website through your agency.'
											) }
											name="payer"
											value="client"
											checked={ data.billing === 'client' }
											onChange={ () => change( { billing: 'client' } ) }
										/>
									</div>
								</fieldset>
							) }
							{ data.billing === 'client' && (
								<div className="agency-site-wizard__form">
									<TextControl
										label={ __( 'Client email' ) }
										type="email"
										autoComplete="email"
										dir="ltr"
										value={ data.email }
										onChange={ ( email ) => change( { email } ) }
										help={ __(
											'This client will pay for the selected sites. For different clients, start a separate batch for each. Setup continues after the purchase.'
										) }
										__next40pxDefaultSize
										__nextHasNoMarginBottom
									/>
								</div>
							) }
						</>
					) }
					{ isMigration && data.method === 'concierge' && (
						<div className="agency-site-wizard__form">
							<TextareaControl
								label={ __( 'Anything we should know? (optional)' ) }
								help={ __( 'Tell us about your preferred timing or any special requirements.' ) }
								value={ data.message }
								onChange={ ( message ) => change( { message } ) }
								__nextHasNoMarginBottom
							/>
						</div>
					) }
				</div>
			);
			primary = { label: __( 'Create site' ), onClick: submitSetup };
			if ( isMigration ) {
				primary.label = data.method === 'concierge' ? __( 'Request migration' ) : __( 'Copy site' );
			}
			if ( ! isDevelopment && data.billing === 'client' ) {
				primary.label = __( 'Send referral' );
			}
			break;
		case 'referral-sent':
			title = __( 'Your referral has been sent' );
			description = __(
				'Your client will receive an invitation to purchase hosting. Setup can continue once they’ve paid.'
			);
			content = (
				<div className="agency-site-wizard__form">
					<div className="agency-site-wizard__panel">
						<p>
							<bdi>{ data.email }</bdi>
						</p>
						<p>{ __( 'Waiting for your client to complete their purchase.' ) }</p>
					</div>
				</div>
			);
			primary = { label: __( 'Check purchase status' ), onClick: completeSetup };
			break;
		case 'requested':
			title =
				batchSize > 1
					? __( 'Your migrations have been requested' )
					: __( 'Your migration has been requested' );
			description = __(
				'Our migration team will follow up to arrange access and timing with you.'
			);
			content = (
				<div className="agency-site-wizard__form">
					<div className="agency-site-wizard__panel">
						<p>
							<bdi>{ batchNames }</bdi>
						</p>
						<p>
							{ __(
								'We’ll prepare a copy on your new hosting, then ask you to review it before switching your domain.'
							) }
						</p>
					</div>
				</div>
			);
			primary = { label: __( 'Check migration status' ), onClick: () => go( 'verify' ) };
			break;
		case 'verify':
			title =
				batchSize > 1 ? __( 'Review your migrated sites' ) : __( 'Review your migrated site' );
			description = __(
				'The copy is ready. Review your pages, media, forms, and store before connecting your domain.'
			);
			content = (
				<div className="agency-site-wizard__form">
					<div className="agency-site-wizard__panel">
						<p>
							<bdi>{ batchNames }</bdi>
						</p>
						<ul>
							<li>{ __( 'Website copied to the new host' ) }</li>
							<li>{ __( 'Original website still online' ) }</li>
							<li>{ __( 'Ready for your review and domain connection' ) }</li>
						</ul>
						{ batch.length > 1 && (
							<ul className="agency-site-wizard__batch-list">
								{ batch.map( ( site ) => (
									<li key={ site.id }>
										<strong>{ site.name }</strong>
										<bdi>{ site.url }</bdi>
									</li>
								) ) }
							</ul>
						) }
					</div>
				</div>
			);
			primary = {
				label:
					batchSize > 1
						? sprintf(
								/* translators: %d is the number of sites. */
								__( 'Confirm and connect %d domains' ),
								batchSize
							)
						: __( 'Confirm and connect domain' ),
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
				description = __(
					'You can now find your connected sites in your agency dashboard. Their hosting hasn’t changed.'
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
		<div className="agency-site-wizard" data-step={ step }>
			<Card className="agency-site-wizard__workspace">
				<AmplifyBackdrop />
				{ isFirstSite && step === 'start' && <HostedShowcase /> }
				<div className="agency-site-wizard__navigation">
					{ canGoBack && (
						<Button
							className="agency-site-wizard__back agency-site-wizard__directional-button"
							variant="tertiary"
							type="button"
							icon={ chevronLeft }
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
						<div className="agency-site-wizard__intro">
							<Heading level={ 2 } id={ titleId } tabIndex={ -1 }>
								{ title }
							</Heading>
							<p>{ description }</p>
						</div>
						<div className="agency-site-wizard__step-content">
							{ batch.length === 1 && step === 'host' && (
								<div className="agency-site-wizard__source-preview">
									<SitePreview
										key={ batch[ 0 ].url }
										site={ batch[ 0 ] }
										simulate={ !! simulation }
										knownSite={ knownSite }
									/>
								</div>
							) }
							{ content }
							{ ! isUrlStep && (
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
