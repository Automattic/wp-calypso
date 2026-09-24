import { staticSiteImportSessionQuery } from '@automattic/api-queries';
import { localizeUrl, useLocale } from '@automattic/i18n-utils';
import { MShotsImage, Step } from '@automattic/onboarding';
import { useQuery } from '@tanstack/react-query';
import {
	Button,
	ExternalLink,
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { _n, sprintf } from '@wordpress/i18n';
import { Icon, check, lock } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useSearchParams } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import Notice from 'calypso/dashboard/components/notice';
import { getIntlLocale } from 'calypso/dashboard/utils/locale';
import {
	ImportCard,
	getStaticSiteImportConfidence,
	useStaticSiteImportSource,
	useStaticSiteImportTicket,
} from '../components/static-site-import';
import type { Step as StepType } from '../../types';
import type {
	StaticSiteImportBlocker,
	StaticSiteImportSetupItem,
} from '../components/static-site-import';
import type { ReactNode } from 'react';

import './style.scss';

export type StaticSiteImportResultsSubmits = { action: 'continue' | 'restart' | 'expert' };

const MSHOTS_OPTIONS = { vpw: 1200, vph: 800, w: 1200, screen_height: 800 };

const strong = { strong: <strong />, span: <span className="static-site-import-results__muted" /> };

type Row = { title: ReactNode; text?: string; link?: { href: string; label: string } };

const FoundRow = ( { title, text, link, isWarning }: Row & { isWarning?: boolean } ) => (
	<HStack justify="flex-start" alignment="top" spacing={ 4 }>
		{ isWarning ? (
			<span className="static-site-import-results__warning" aria-hidden="true">
				!
			</span>
		) : (
			<Icon icon={ check } size={ 24 } fill="var( --studio-green-50 )" />
		) }
		<VStack spacing={ 1 }>
			<span>{ title }</span>
			{ text && <Text variant="muted">{ text }</Text> }
			{ link && <ExternalLink href={ link.href }>{ link.label }</ExternalLink> }
		</VStack>
	</HStack>
);

const StaticSiteImportResults: StepType< { submits: StaticSiteImportResultsSubmits } > =
	function StaticSiteImportResults( { navigation } ) {
		const { __ } = useI18n();
		const locale = useLocale();
		const [ searchParams ] = useSearchParams();
		const sessionId = searchParams.get( 'importSessionId' ) ?? '';
		const { sourceUrl, host, platformName } = useStaticSiteImportSource();
		const {
			sendTicket,
			isPending: isSendingTicket,
			isError: ticketFailed,
		} = useStaticSiteImportTicket();
		const {
			data: session,
			isPending,
			error,
		} = useQuery( {
			...staticSiteImportSessionQuery( sessionId ),
			enabled: Boolean( sessionId ),
		} );

		const hasPreview = session?.state === 'preview_ready';
		const needsRestart = ! sessionId || Boolean( error ) || ( Boolean( session ) && ! hasPreview );

		const summary = Array.isArray( session?.preview_summary )
			? undefined
			: session?.preview_summary;
		const { outcome, blockers, setup, isComplete } = getStaticSiteImportConfidence( summary );
		const pages = summary?.pages;
		const oldPlatform = platformName ?? __( 'your current host' );

		const blockerNames: Record< StaticSiteImportBlocker, string > = {
			store: __( 'store' ),
			bookings: __( 'bookings' ),
			membership: __( 'member logins' ),
		};

		const blockerRows: Record< StaticSiteImportBlocker, Row > = {
			store: {
				title: createInterpolateElement(
					__( '<strong>Your online store</strong> <span>can’t be moved</span>' ),
					strong
				),
				text: sprintf(
					/* translators: %s: the platform the site is hosted on today, e.g. Wix. */
					__(
						'Your products, prices, payments, and shipping stay in %s. You’ll set up your store again on WordPress.com.'
					),
					oldPlatform
				),
				link: {
					href: localizeUrl( 'https://wordpress.com/support/introduction-to-woocommerce/' ),
					label: __( 'How to set up a store' ),
				},
			},
			bookings: {
				title: createInterpolateElement(
					__( '<strong>Your booking system</strong> <span>can’t be moved</span>' ),
					strong
				),
				text: sprintf(
					/* translators: %s: the platform the site is hosted on today, e.g. Wix. */
					__(
						'Your calendar and bookings stay in %s. You can add a booking plugin or a tool like Calendly.'
					),
					oldPlatform
				),
				link: {
					href: localizeUrl(
						'https://wordpress.com/support/wordpress-editor/blocks/calendly-block/'
					),
					label: __( 'How to add bookings' ),
				},
			},
			membership: {
				title: createInterpolateElement(
					__( '<strong>Member logins</strong> <span>can’t be moved</span>' ),
					strong
				),
				text: sprintf(
					/* translators: %s: the platform the site is hosted on today, e.g. Wix. */
					__( 'Your members and their accounts stay in %s.' ),
					oldPlatform
				),
			},
		};

		const setupRows: Record< StaticSiteImportSetupItem, Row > = {
			form: {
				title: createInterpolateElement(
					__( '<strong>Your contact form</strong> <span>has to be rebuilt</span>' ),
					strong
				),
				text: __( 'You’ll add a new form with the same fields.' ),
				link: {
					href: localizeUrl( 'https://wordpress.com/support/wordpress-editor/blocks/form-block/' ),
					label: __( 'How to rebuild your contact form' ),
				},
			},
			embeds: {
				title: createInterpolateElement(
					__( '<strong>Embedded content</strong> <span>to check</span>' ),
					strong
				),
				text: __( 'Maps, videos, and widgets from other services may need to be added again.' ),
			},
			sections: {
				title: createInterpolateElement(
					__( '<strong>Some sections</strong> <span>need a look</span>' ),
					strong
				),
				text: __(
					'A few parts of your pages didn’t convert cleanly. You can fix them in the editor.'
				),
			},
			layout: {
				title: createInterpolateElement(
					__( '<strong>Some pages</strong> <span>look a little different</span>' ),
					strong
				),
				text: __( 'We’ll show you which ones so you can compare them with your current site.' ),
			},
			pages: {
				title: createInterpolateElement(
					__( '<strong>Some pages</strong> <span>weren’t found</span>' ),
					strong
				),
				text: __( 'Pages that aren’t linked from your site can be added again afterwards.' ),
			},
		};

		const foundRows: Row[] = [
			...( pages
				? [
						{
							title: createInterpolateElement(
								sprintf(
									/* translators: %d: number of pages found on the site. */
									_n( '<strong>%d page</strong>', '<strong>%d pages</strong>', pages ),
									pages
								),
								strong
							),
						},
					]
				: [] ),
			{
				title: createInterpolateElement(
					__( '<strong>Your images</strong> <span>in full quality</span>' ),
					strong
				),
			},
			{
				title: createInterpolateElement(
					__( '<strong>Fonts, colors, and layout</strong> <span>carried over</span>' ),
					strong
				),
			},
		];

		const heading = {
			everything: __( 'We can move your site' ),
			'almost-everything': __( 'We can move almost all of your site' ),
			'manual-work': __( 'Some parts of your site can’t be moved automatically' ),
		}[ outcome ];

		const listFormat = new Intl.ListFormat( getIntlLocale( locale ), { type: 'conjunction' } );
		const confidenceNotice = {
			everything: isComplete
				? __( 'High confidence. Everything can come with you.' )
				: __( 'Good confidence. Everything we checked can come with you.' ),
			'almost-everything': sprintf(
				/* translators: %d: number of things the user has to set up after the move. */
				_n(
					'Good confidence. %d thing to set up after the move.',
					'Good confidence. %d things to set up after the move.',
					setup.length
				),
				setup.length
			),
			'manual-work': sprintf(
				/* translators: %s: a list of site features, e.g. "store and bookings". */
				__( 'Your pages and design can move. Your %s can’t.' ),
				listFormat.format( blockers.map( ( blocker ) => blockerNames[ blocker ] ) )
			),
		}[ outcome ];

		const nextSteps = [
			{
				title: __( 'Choose your address and a plan' ),
				text: host
					? sprintf(
							/* translators: %s: the site's domain, e.g. example.com. */
							__( 'Keep %s or pick a new one.' ),
							host
						)
					: __( 'Keep your domain or pick a new one.' ),
			},
			{
				title: __( 'We rebuild your site' ),
				text: __( 'Your pages, images, and design. We’ll email you when it’s ready.' ),
			},
			{
				title: __( 'You take a look, then switch your address' ),
				text: sprintf(
					/* translators: %s: the platform the site is hosted on today, e.g. Wix. */
					__( '%s keeps running until you do.' ),
					platformName ?? __( 'Your current site' )
				),
			},
		];

		const onTalkToExpert = async () => {
			try {
				await sendTicket( `Static site import: needs an expert for ${ blockers.join( ', ' ) }.` );
				navigation.submit?.( { action: 'expert' } );
			} catch {
				// Shown by the error notice.
			}
		};

		const renderActions = () => {
			if ( needsRestart ) {
				return (
					<div>
						<Button
							__next40pxDefaultSize
							variant="primary"
							onClick={ () => navigation.submit?.( { action: 'restart' } ) }
						>
							{ __( 'Read my site again' ) }
						</Button>
					</div>
				);
			}

			if ( outcome === 'manual-work' ) {
				return (
					<VStack spacing={ 4 }>
						{ ticketFailed && (
							<Notice variant="error">
								{ __( 'We couldn’t reach our migrations team. Please try again.' ) }
							</Notice>
						) }
						<div className="static-site-import-results__choices">
							<VStack spacing={ 2 }>
								<Button
									__next40pxDefaultSize
									variant="primary"
									isBusy={ isSendingTicket }
									disabled={ isSendingTicket }
									onClick={ onTalkToExpert }
								>
									{ __( 'Talk to a migration expert' ) }
								</Button>
								<Text variant="muted" align="center">
									{ __( 'Hear your options for the parts that can’t move' ) }
								</Text>
							</VStack>
							<VStack spacing={ 2 }>
								<Button
									__next40pxDefaultSize
									variant="secondary"
									onClick={ () => navigation.submit?.( { action: 'continue' } ) }
								>
									{ __( 'Continue without these items' ) }
								</Button>
								<Text variant="muted" align="center">
									{ __( 'Move the rest of your site now' ) }
								</Text>
							</VStack>
						</div>
					</VStack>
				);
			}

			return (
				<div>
					<Button
						__next40pxDefaultSize
						variant="primary"
						isBusy={ isPending }
						disabled={ ! hasPreview }
						onClick={ () => navigation.submit?.( { action: 'continue' } ) }
					>
						{ __( 'Move my site' ) }
					</Button>
				</div>
			);
		};

		return (
			<>
				<DocumentHead title={ heading } />
				<Step.CenteredColumnLayout
					className="step-container-v2--static-site-import-results"
					columnWidth={ 8 }
					topBar={ <Step.TopBar /> }
					heading={
						<Step.Heading
							text={ heading }
							subText={ __( 'Here’s your homepage as it looks today.' ) }
						/>
					}
				>
					<VStack spacing={ 8 }>
						{ host && (
							<div className="static-site-import-results__frame">
								<div className="static-site-import-results__frame-bar">
									<Icon icon={ lock } size={ 18 } />
									<span
										id="static-site-import-results-host"
										className="static-site-import-results__frame-url"
									>
										{ host }
									</span>
									{ platformName && (
										<span>
											{ sprintf(
												/* translators: %s: the platform the site is hosted on today, e.g. Wix. */
												__( 'Hosted with %s' ),
												platformName
											) }
										</span>
									) }
								</div>
								<MShotsImage
									url={ sourceUrl }
									alt={ sprintf(
										/* translators: %s: the site's domain, e.g. example.com. */
										__( 'The homepage of %s' ),
										host
									) }
									aria-labelledby="static-site-import-results-host"
									options={ MSHOTS_OPTIONS }
								/>
							</div>
						) }

						{ hasPreview && (
							<Notice variant={ outcome === 'everything' ? 'success' : 'warning' }>
								{ confidenceNotice }
							</Notice>
						) }

						<ImportCard>
							{ hasPreview && (
								<VStack spacing={ 4 }>
									<Heading level={ 2 } size={ 20 } weight={ 600 }>
										{ __( 'What we found' ) }
									</Heading>
									{ foundRows.map( ( row, index ) => (
										<FoundRow key={ `found-${ index }` } { ...row } />
									) ) }
									{ setup.map( ( item ) => (
										<FoundRow key={ item } { ...setupRows[ item ] } isWarning />
									) ) }
									{ blockers.map( ( blocker ) => (
										<FoundRow key={ blocker } { ...blockerRows[ blocker ] } isWarning />
									) ) }
								</VStack>
							) }

							{ hasPreview && outcome !== 'manual-work' && (
								<VStack spacing={ 4 }>
									<Heading level={ 2 } size={ 20 } weight={ 600 }>
										{ __( 'What happens next' ) }
									</Heading>
									<ol className="static-site-import-results__next">
										{ nextSteps.map( ( step ) => (
											<li key={ step.title }>
												<VStack spacing={ 1 }>
													<span>{ step.title }</span>
													<Text variant="muted">{ step.text }</Text>
												</VStack>
											</li>
										) ) }
									</ol>
								</VStack>
							) }

							{ needsRestart && (
								<Notice variant="error">
									{ __(
										'It’s been a while since we read your site, so we need to take a fresh look before moving it.'
									) }
								</Notice>
							) }

							{ renderActions() }
						</ImportCard>
					</VStack>
				</Step.CenteredColumnLayout>
			</>
		);
	};

export default StaticSiteImportResults;
