import { wowFunnelPendingQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Button, Modal, __experimentalHStack as HStack } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { Icon, chevronDown, external, wordpress } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { getSourceHost } from 'calypso/dashboard/sites/overview-static-site-import/use-static-site-import';
import type { Step as StepType } from '../../types';

import './style.scss';

export type StaticSiteImportReadyStepSubmits = { action: 'launch' };

// The share link is made when the build lands, so it can come a little after the move finishes.
const SHARE_URL_POLL_INTERVAL = 3000;
const SHARE_URL_MAX_POLLS = 40;

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
	const { data: pending } = useQuery( {
		...wowFunnelPendingQuery(),
		staleTime: 0,
		refetchInterval: ( query ) => {
			const found = query.state.data?.preview_sites?.find( ( p ) => p.blog_id === siteId );
			// Until the preview is listed with its share link, which can lag the move by a little.
			return ! found?.share_url && query.state.dataUpdateCount < SHARE_URL_MAX_POLLS
				? SHARE_URL_POLL_INTERVAL
				: false;
		},
	} );
	const preview = pending?.preview_sites?.find( ( p ) => p.blog_id === siteId );
	const shareUrl = preview?.share_url || undefined;
	const sourceHost = getSourceHost( from );
	// The share link gets past Coming Soon, for the preview and for anyone it's opened in.
	const siteUrl = shareUrl || ( siteSlug ? `https://${ siteSlug }` : '' );
	const destinationHost = getSourceHost( siteUrl );

	// The welcome asks first; looking around moves it to a card in the corner, which can fold away.
	const [ view, setView ] = useState< 'welcome' | 'card' | 'folded' >( 'welcome' );
	const launch = () => navigation.submit?.( { action: 'launch' } );

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
				{ shareUrl && (
					<iframe
						className="static-site-import-ready-step__site"
						src={ shareUrl }
						title={ __( 'Your site on WordPress.com' ) }
					/>
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
						<Button __next40pxDefaultSize variant="secondary" onClick={ launch }>
							{ __( 'Launch site' ) }
						</Button>
						<Button
							__next40pxDefaultSize
							variant="primary"
							onClick={ () => setView( 'card' ) }
							disabled={ ! shareUrl }
						>
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
					<Button __next40pxDefaultSize variant="primary" onClick={ launch }>
						{ __( 'Launch site' ) }
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
					<Button size="compact" __next40pxDefaultSize variant="primary" onClick={ launch }>
						{ __( 'Launch site' ) }
					</Button>
				</section>
			) }
		</>
	);
};

export default StaticSiteImportReadyStep;
