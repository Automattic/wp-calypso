import { activeAgencyQuery, agencyDevLicensesQuery } from '@automattic/api-queries';
import { WordPressLogo } from '@automattic/components/src/logos/wordpress-logo';
import { useQuery } from '@tanstack/react-query';
import {
	Button,
	CheckboxControl,
	RadioControl,
	TextareaControl,
	TextControl,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { useEffect, useRef } from 'react';
import pressableIcon from 'calypso/assets/images/pressable/pressable-icon.svg';
import { useAnalytics } from '../../../app/analytics';
import { getMarketplaceHostingSectionRoute } from '../../marketplace/paths';
import { getFormatError } from '../../marketplace/purchases/use-site-address';
import {
	getA4APluginInstallUrl,
	getJetpackConnectUrl,
	isAgencyApproved,
	parseSiteUrl,
} from '../add-new-site/lib';
import { Choice, RadioChoice } from './choices';
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
		error,
		setError,
		result,
		setResult,
	} = useSiteWizard( onStart );
	const container = useRef< HTMLDivElement >( null );
	const previousStep = useRef( step );
	useEffect( () => {
		if ( previousStep.current !== step ) {
			if ( container.current ) {
				container.current.scrollTop = 0;
				container.current.querySelector< HTMLElement >( 'h2' )?.focus( { preventScroll: true } );
			}
			previousStep.current = step;
		}
	}, [ step ] );
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
	const validateUrl = () => {
		if ( ! source || source.username || source.password ) {
			setError( __( 'Enter a valid website address, such as example.com.' ) );
			return;
		}
		if ( ! isMigration && simulation?.managedSites.some( ( site ) => site.url === source.host ) ) {
			setError(
				__( 'This site is already in your dashboard. Choose another address or return to Sites.' )
			);
			return;
		}
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
			simulation.onConnect( data.url );
			setResult( __( 'Your site is connected' ) );
		} else {
			simulation.onCreateHosted(
				kind === 'migrate' ? data.url : siteAddress,
				data.name,
				data.host,
				isDevelopment
			);
			let completion = __( 'Your new site is ready' );
			if ( isDevelopment ) {
				completion = __( 'Your development site is ready' );
			}
			if ( kind === 'migrate' ) {
				completion = __( 'Your migration is complete' );
			}
			setResult( completion );
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
			description = __(
				'Connect a website you manage, move its hosting, or create something new.'
			);
			content = (
				<div className="agency-site-wizard__choices agency-site-wizard__choices--three">
					<Choice
						title={ __( 'Connect a site' ) }
						description={ __(
							'Add an existing WordPress website to your dashboard. Keep its current hosting.'
						) }
						onClick={ () => chooseJourney( 'connect', 'url' ) }
					/>
					<Choice
						title={ __( 'Move a site' ) }
						description={ __(
							'Bring an existing WordPress website to WordPress.com or Pressable hosting.'
						) }
						onClick={ () => chooseJourney( 'migrate', 'source' ) }
					/>
					<Choice
						title={ __( 'Create a site' ) }
						description={ __( 'Build a new website for your agency or a client.' ) }
						onClick={ () => go( 'new' ) }
					/>
				</div>
			);
			break;
		case 'new':
			title = __( 'What kind of site are you creating?' );
			description = __(
				'Choose whether you’re building a project or setting up a website for visitors.'
			);
			content = (
				<div className="agency-site-wizard__choices">
					<Choice
						title={ __( 'Development site' ) }
						badge={ __( 'Free' ) }
						description={ __(
							'Build and share a preview with your client on WordPress.com. Pay for hosting when you’re ready to launch.'
						) }
						onClick={ startDevelopment }
					/>
					<Choice
						title={ __( 'Production site' ) }
						badge={ __( 'Paid' ) }
						description={ __(
							'Create a website with paid hosting on WordPress.com or Pressable. Connect a domain and publish when it’s ready.'
						) }
						onClick={ () => chooseJourney( 'hosted', 'host' ) }
					/>
				</div>
			);
			break;
		case 'url':
		case 'source':
			title = isMigration
				? __( 'Which site are you moving?' )
				: __( 'Which site are you connecting?' );
			description = isMigration
				? __(
						'Enter the address of the website you want to move. We’ll choose its new hosting next.'
					)
				: __(
						'Enter your WordPress website’s address. Connecting it adds it to this dashboard without moving its hosting.'
					);
			content = (
				<div className="agency-site-wizard__form">
					<TextControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Site address' ) }
						placeholder="example.com"
						value={ data.url }
						onChange={ ( url ) => change( { url } ) }
						autoComplete="url"
						dir="ltr"
					/>
					{ ! isMigration && (
						<Button
							variant="link"
							onClick={ () =>
								simulation ? go( 'picker' ) : onSelectAction( 'import-from-wpcom' )
							}
						>
							{ __( 'Choose sites from my account' ) }
						</Button>
					) }
				</div>
			);
			primary = { label: __( 'Continue' ), onClick: validateUrl };
			break;
		case 'picker':
			title = __( 'Choose sites to connect' );
			description = __(
				'Select one or more sites already associated with your WordPress.com account.'
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
				label: __( 'Connect selected sites' ),
				onClick: () =>
					data.selected.length
						? finish( 'picker' )
						: setError( __( 'Select at least one site to continue.' ) ),
			};
			break;
		case 'authorize': {
			title = __( 'Connect your site' );
			description = knownSite
				? __(
						'This website is already associated with your WordPress.com account. Add it to your agency dashboard.'
					)
				: __( 'Connect with your agency account so this website appears in your dashboard.' );
			const installer =
				data.plugin === 'a4a'
					? getA4APluginInstallUrl( data.url )
					: getJetpackConnectUrl( data.url );
			content = (
				<div className="agency-site-wizard__form">
					<div className="agency-site-wizard__panel">
						<strong>
							<bdi>{ source?.host }</bdi>
						</strong>
						<p>{ __( 'Your website and its hosting stay where they are.' ) }</p>
						{ ! knownSite && (
							<>
								<p>
									{ __(
										'Install the lightweight Automattic for Agencies plugin, then approve the connection using your agency account. You’ll need administrator access to the website.'
									) }
								</p>
								<details className="agency-site-wizard__alternative">
									<summary>{ __( 'Connection options' ) }</summary>
									<RadioControl
										label={ __( 'Connect using' ) }
										selected={ data.plugin }
										onChange={ ( plugin ) => change( { plugin: plugin as 'a4a' | 'jetpack' } ) }
										options={ [
											{
												label: __( 'Automattic for Agencies — lightweight connection' ),
												value: 'a4a',
											},
											{
												label: __( 'Jetpack — includes plugin management and single sign-on' ),
												value: 'jetpack',
											},
										] }
									/>
								</details>
							</>
						) }
					</div>
				</div>
			);
			primary = simulation
				? {
						label: __( 'Approve connection' ),
						onClick: () =>
							knownSite ? finish( 'picker', [ knownSite.ID ] ) : finish( 'connect' ),
					}
				: { label: __( 'Install and connect' ), href: installer ?? undefined, external: true };
			break;
		}
		case 'host':
			title = __( 'Choose your hosting' );
			description = __(
				'Both hosts support custom themes and plugins, backups, and managed WordPress hosting. Choose the way you want to buy and manage it.'
			);
			content = (
				<div className="agency-site-wizard__sections">
					<fieldset className="agency-site-wizard__fieldset">
						<legend className="screen-reader-text">{ __( 'Hosting provider' ) }</legend>
						<div className="agency-site-wizard__choices">
							<RadioChoice
								title="WordPress.com"
								description={ __(
									'A Business plan for each website. A straightforward choice when you want to manage and pay for client websites individually.'
								) }
								name="host"
								value="wpcom"
								checked={ data.host === 'wpcom' }
								onChange={ () => change( { host: 'wpcom' } ) }
								icon={ <WordPressLogo size={ 32 } /> }
							>
								<ul>
									<li>{ __( 'Pay per site, with discounts as you add more' ) }</li>
									<li>{ __( 'Unlimited traffic and bandwidth' ) }</li>
									<li>{ __( 'Manage your sites through WordPress.com' ) }</li>
								</ul>
							</RadioChoice>
							<RadioChoice
								title="Pressable"
								description={ __(
									'A hosting plan for one or many websites. A useful choice when you want to manage an agency portfolio under a shared plan.'
								) }
								name="host"
								value="pressable"
								checked={ data.host === 'pressable' }
								onChange={ () => change( { host: 'pressable' } ) }
								icon={ <img className="agency-site-wizard__brand" src={ pressableIcon } alt="" /> }
							>
								<ul>
									<li>{ __( 'Choose a plan by site count, traffic, and storage' ) }</li>
									<li>{ __( 'Staging and sandbox sites included' ) }</li>
									<li>{ __( 'Manage hosting in the Pressable control panel' ) }</li>
								</ul>
							</RadioChoice>
						</div>
					</fieldset>
					{ isMigration && (
						<fieldset className="agency-site-wizard__fieldset">
							<legend>{ __( 'Who should handle the move?' ) }</legend>
							<div className="agency-site-wizard__choices">
								<RadioChoice
									title={ __( 'Move it for me' ) }
									description={ __(
										'Our team copies the site and coordinates the move with you. You review it before switching the domain.'
									) }
									name="method"
									value="concierge"
									checked={ data.method === 'concierge' }
									onChange={ () => change( { method: 'concierge' } ) }
								/>
								<RadioChoice
									title={ __( 'I’ll move it myself' ) }
									description={ __(
										'Use the migration tools to copy the site, check it, and connect your domain.'
									) }
									name="method"
									value="self"
									checked={ data.method === 'self' }
									onChange={ () => change( { method: 'self' } ) }
								/>
							</div>
						</fieldset>
					) }
				</div>
			);
			primary = { label: __( 'Continue' ), onClick: () => go( 'setup' ) };
			break;
		case 'setup':
			title = isMigration ? __( 'Arrange your migration' ) : __( 'Set up your site' );
			description = isDevelopment
				? __( 'Build on WordPress.com at no cost. A paid hosting plan is needed when you launch.' )
				: sprintf(
						/* translators: %s is the hosting provider. */
						__( 'Your website will be hosted on %s. Choose who pays for the hosting below.' ),
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
							<bdi>{ source?.host }</bdi>
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
									help={
										data.host === 'wpcom'
											? __(
													'You already have a Business plan that isn’t assigned to a website. Use it for this site instead of buying another. Its existing billing continues.'
												)
											: __(
													'Your agency’s plan covers 5 websites, and 4 are in use. This website can be the fifth. Your existing plan’s billing continues.'
												)
									}
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
											'We’ll send the hosting purchase invitation to this address. Setup continues after your client completes the purchase.'
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
			title = __( 'Your migration has been requested' );
			description = __(
				'Our migration team will follow up to arrange access and timing with you.'
			);
			content = (
				<div className="agency-site-wizard__form">
					<div className="agency-site-wizard__panel">
						<p>
							<bdi>{ source?.host }</bdi>
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
			title = __( 'Review your migrated site' );
			description = __(
				'The copy is ready. Review your pages, media, forms, and store before connecting your domain.'
			);
			content = (
				<div className="agency-site-wizard__form">
					<div className="agency-site-wizard__panel">
						<p>
							<bdi>{ source?.host }</bdi>
						</p>
						<ul>
							<li>{ __( 'Website copied to the new host' ) }</li>
							<li>{ __( 'Original website still online' ) }</li>
							<li>{ __( 'Ready for your review and domain connection' ) }</li>
						</ul>
					</div>
				</div>
			);
			primary = { label: __( 'Confirm and connect domain' ), onClick: () => finish( 'migrate' ) };
			break;
		case 'success':
			title = result;
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
			secondary = { label: __( 'Add another site' ), onClick: restart };
	}

	const canGoBack = ! [ 'start', 'success', 'requested', 'referral-sent', 'verify' ].includes(
		step
	);
	return (
		<div className="agency-site-wizard">
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
						<Heading level={ 2 } tabIndex={ -1 }>
							{ title }
						</Heading>
						<p>{ description }</p>
					</div>
					{ content }
				</div>
				<p className="agency-site-wizard__error" role="alert">
					{ error }
				</p>
				<div
					className="agency-site-wizard__footer"
					data-empty={ ! canGoBack && ! primary && ! secondary }
				>
					{ canGoBack && (
						<Button variant="secondary" __next40pxDefaultSize onClick={ back }>
							{ __( 'Back' ) }
						</Button>
					) }
					<div className="agency-site-wizard__footer-end">
						{ secondary && (
							<Button
								variant="secondary"
								__next40pxDefaultSize
								href={ secondary.href }
								onClick={ secondary.onClick }
							>
								{ secondary.label }
							</Button>
						) }
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
					</div>
				</div>
			</form>
		</div>
	);
}
