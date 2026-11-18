import { sitePreviewLinkCreateMutation, sitePreviewLinksQuery } from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Modal, Spinner, __experimentalHStack as HStack } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { Icon, chevronDown, external, wordpress } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import { useEffect, useRef, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { getSourceHost } from 'calypso/dashboard/sites/overview-static-site-import/use-static-site-import';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import type { Step as StepType } from '../../types';

import './style.scss';

export type StaticSiteImportReadyStepSubmits = { action: 'choose_plan' };

const StaticSiteImportReadyStep: StepType< {
	accepts: {
		/** The preview the site was copied onto. */
		siteId?: number;
		siteSlug?: string;
		/** The source that was copied, as the customer gave it. */
		from?: string;
	};
	submits: StaticSiteImportReadyStepSubmits;
} > = function StaticSiteImportReadyStep( { navigation, siteId, siteSlug, from } ) {
	const { __ } = useI18n();
	// The share link gets past Coming Soon, for the preview and for anyone it's opened in. Use the
	// one the preview has, or make one.
	const { data: links, isError: hasLinksError } = useQuery( {
		...sitePreviewLinksQuery( siteId ?? 0 ),
		enabled: Boolean( siteId ),
	} );
	const {
		mutate: createLink,
		data: createdLink,
		isError: hasCreateError,
	} = useMutation( sitePreviewLinkCreateMutation( siteId ?? 0 ) );
	const hasAskedForLink = useRef( false );
	useEffect( () => {
		if ( links?.length === 0 && ! hasAskedForLink.current ) {
			hasAskedForLink.current = true;
			createLink();
		}
	}, [ links, createLink ] );
	const site = useSite( siteId );
	const siteHome = site?.URL || ( siteSlug ? `https://${ siteSlug }` : '' );
	const shareCode = links?.[ 0 ]?.code ?? createdLink?.code;
	const shareUrl =
		shareCode && siteHome
			? addQueryArgs( `${ siteHome.replace( /\/+$/, '' ) }/`, { share: shareCode } )
			: undefined;
	const hasGivenUp = ! siteId || hasLinksError || hasCreateError;
	const sourceHost = getSourceHost( from );
	const siteUrl = shareUrl || siteHome;
	const destinationHost = getSourceHost( siteUrl );

	// The welcome asks first; looking around moves it to a card in the corner, which can fold away.
	const [ view, setView ] = useState< 'welcome' | 'card' | 'folded' >( 'welcome' );
	const choosePlan = () => navigation.submit?.( { action: 'choose_plan' } );

	const addresses = (
		<dl className="static-site-import-ready-step__addresses">
			{ sourceHost && (
				<>
					<dt>{ __( 'From' ) }</dt>
					<dd>{ sourceHost }</dd>
				</>
			) }
			{ destinationHost && (
				<>
					<dt>{ __( 'To' ) }</dt>
					<dd>
						<a href={ siteUrl } target="_blank" rel="noreferrer">
							{ destinationHost }
							<Icon icon={ external } size={ 16 } />
						</a>
					</dd>
				</>
			) }
		</dl>
	);

	return (
		<>
			<DocumentHead title={ __( 'Your site is on WordPress.com' ) } />
			<div className="static-site-import-ready-step">
				{ /* Only the share link gets past Coming Soon, so the preview waits for it. */ }
				{ shareUrl ? (
					<iframe
						className="static-site-import-ready-step__site"
						src={ shareUrl }
						title={ __( 'Your site on WordPress.com' ) }
					/>
				) : (
					<div className="static-site-import-ready-step__loading" role="status">
						{ hasGivenUp ? (
							<span>
								{ __( 'We couldn’t load your site here. You can still choose a plan for it.' ) }
							</span>
						) : (
							<>
								<Spinner />
								<span>{ __( 'Loading your site…' ) }</span>
							</>
						) }
					</div>
				) }
			</div>
			{ view === 'welcome' && (
				<Modal
					className="static-site-import-ready-step__modal"
					title={ __( 'Your site is on WordPress.com' ) }
					size="medium"
					isDismissible={ false }
					shouldCloseOnClickOutside={ false }
					shouldCloseOnEsc={ false }
					onRequestClose={ () => {} }
				>
					<p>
						{ sourceHost
							? sprintf(
									/* translators: %s: the domain of the site that was copied, e.g. example.com. */
									__(
										'We copied %s onto a private preview. Click around: every page is here and works. Launch it when you’re happy.'
									),
									sourceHost
								)
							: __(
									'We copied your site onto a private preview. Click around: every page is here and works. Launch it when you’re happy.'
								) }
					</p>
					{ addresses }
					<HStack justify="flex-end" spacing={ 3 }>
						<Button __next40pxDefaultSize variant="primary" onClick={ () => setView( 'card' ) }>
							{ __( 'Look around' ) }
						</Button>
					</HStack>
				</Modal>
			) }
			{ view === 'card' && (
				<section
					className="static-site-import-ready-step__card"
					aria-labelledby="static-site-import-ready-step-card-title"
				>
					<HStack alignment="top" spacing={ 3 }>
						<Icon icon={ wordpress } size={ 32 } className="static-site-import-ready-step__logo" />
						<h2 id="static-site-import-ready-step-card-title">
							{ __( 'This is your site on WordPress.com' ) }
						</h2>
						<Button
							icon={ chevronDown }
							label={ __( 'Minimize' ) }
							size="small"
							onClick={ () => setView( 'folded' ) }
						/>
					</HStack>
					{ addresses }
					<p>{ __( 'Private for now. Look around, then launch it when you’re ready.' ) }</p>
					<Button __next40pxDefaultSize variant="primary" onClick={ choosePlan }>
						{ __( 'Choose a plan' ) }
					</Button>
				</section>
			) }
			{ view === 'folded' && (
				<section
					className="static-site-import-ready-step__pill"
					aria-label={ __( 'Your site on WordPress.com' ) }
				>
					<Button
						className="static-site-import-ready-step__expand"
						icon={ wordpress }
						iconSize={ 24 }
						onClick={ () => setView( 'card' ) }
						aria-expanded={ false }
					>
						{ __( 'Your site on WordPress.com' ) }
					</Button>
					<Button size="compact" __next40pxDefaultSize variant="primary" onClick={ choosePlan }>
						{ __( 'Choose a plan' ) }
					</Button>
				</section>
			) }
		</>
	);
};

export default StaticSiteImportReadyStep;
