import { Card } from '@automattic/components';
import { useQueries } from '@tanstack/react-query';
import { Spinner } from '@wordpress/components';
import { useCallback, useEffect, useMemo, useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import FullWidthSection from 'calypso/components/full-width-section';
import { getWPCOMPluginQueryParams } from 'calypso/data/marketplace/use-wpcom-plugins-query';
import { getWPORGPluginQueryParams } from 'calypso/data/marketplace/use-wporg-plugin-query';
import { useIsMarketplaceRedesignEnabled } from 'calypso/my-sites/plugins/hooks/use-is-marketplace-redesign-enabled';
import PluginsResultsHeader from 'calypso/my-sites/plugins/plugins-results-header';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { submitChatMessage } from './chat-actions';
import HydratedPick from './hydrated-pick';
import { useIsLooking, usePicks } from './picks-store';
import PromptForm from './prompt-form';

import 'calypso/my-sites/plugins/plugins-browser-list/style.scss';
import './style.scss';

function hasRenderableName( data: unknown ): boolean {
	return (
		!! data && typeof data === 'object' && typeof ( data as { name?: unknown } ).name === 'string'
	);
}

export default function MarketplaceAIExperience(): JSX.Element {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug );
	const locale = useSelector( getCurrentUserLocale );
	const isMarketplaceRedesign = useIsMarketplaceRedesignEnabled();
	const [ picks ] = usePicks();
	const [ looking, setLooking ] = useIsLooking();
	const [ promptOpen, setPromptOpen ] = useState( false );

	// Clear on unmount so the next mount's first render reads `false`.
	useEffect( () => {
		return () => {
			setLooking( false );
		};
	}, [ setLooking ] );

	// Safety net: Drop the looking state after a max wait
	// so the user isn't stuck on the spinner forever.
	useEffect( () => {
		if ( ! looking ) {
			return;
		}

		const timer = window.setTimeout( () => {
			setLooking( false );
		}, 30000 );

		return () => window.clearTimeout( timer );
	}, [ looking, setLooking ] );

	const handlePromptSubmit = useCallback(
		( prompt: string ) => {
			setLooking( true );
			setPromptOpen( false );
			void submitChatMessage( prompt );
		},
		[ setLooking ]
	);

	// Run all plugin hydration queries in one batch.
	const queryConfigs = useMemo(
		() =>
			picks.map( ( p ) =>
				p.source === 'commercial'
					? getWPCOMPluginQueryParams( p.slug )
					: getWPORGPluginQueryParams( p.slug, locale )
			),
		[ picks, locale ]
	);
	const queries = useQueries( { queries: queryConfigs } );

	const hydrated = picks.map( ( pick, i ) => ( {
		pick,
		data: queries[ i ]?.data as unknown,
		isLoading: queries[ i ]?.isLoading ?? false,
		isError: queries[ i ]?.isError ?? false,
	} ) );

	const validPicks = hydrated.filter(
		( h ) => h.isLoading || ( ! h.isError && hasRenderableName( h.data ) )
	);
	const hasPicks = validPicks.length > 0;
	const [ hero, ...rest ] = validPicks;

	const loadingNode = (
		<div
			className="marketplace-ai-experience__prompt-panel-loading"
			role="status"
			aria-live="polite"
		>
			<p>
				{ translate(
					'Browsing through the catalog to find the best matches for your site. This usually takes a few seconds.'
				) }
			</p>
			<Spinner />
		</div>
	);

	const refineExpanded = promptOpen || looking;

	return (
		<FullWidthSection enabled={ isMarketplaceRedesign }>
			<div className="marketplace-ai-experience">
				{ hasPicks ? (
					<>
						<div className="marketplace-ai-experience__refine">
							<button
								type="button"
								className="marketplace-ai-experience__refine-banner"
								onClick={ () => setPromptOpen( ! promptOpen ) }
								aria-expanded={ refineExpanded }
							>
								<span className="marketplace-ai-experience__refine-banner-icon" aria-hidden="true">
									✦
								</span>
								<span className="marketplace-ai-experience__refine-banner-text">
									{ translate(
										'Ask follow-up questions about these results, or refine your search with more details'
									) }
								</span>
								<span
									className="marketplace-ai-experience__refine-banner-chevron"
									aria-hidden="true"
								>
									▾
								</span>
							</button>

							{ refineExpanded && (
								<div className="marketplace-ai-experience__refine-body">
									{ looking ? (
										loadingNode
									) : (
										<PromptForm onSubmit={ handlePromptSubmit } mode="followup" />
									) }
								</div>
							) }
						</div>

						<div className="marketplace-ai-experience__results">
							<section className="plugins-browser-list">
								<PluginsResultsHeader title={ translate( 'Top recommendation' ) } subtitle="" />

								<Card tagName="ul" className="hero-pick plugins-browser-list__elements">
									<HydratedPick
										pick={ hero.pick }
										data={ hero.data }
										isLoading={ hero.isLoading }
										siteSlug={ siteSlug }
									/>
								</Card>
							</section>

							{ rest.length > 0 && (
								<section className="plugins-browser-list">
									<PluginsResultsHeader
										title={ translate( 'Other recommendations' ) }
										subtitle=""
									/>

									<Card tagName="ul" className="plugins-browser-list__elements">
										{ rest.map( ( h ) => (
											<HydratedPick
												key={ h.pick.slug }
												pick={ h.pick }
												data={ h.data }
												isLoading={ h.isLoading }
												siteSlug={ siteSlug }
											/>
										) ) }
									</Card>
								</section>
							) }
						</div>
					</>
				) : (
					<div className="marketplace-ai-experience__prompt-panel">
						<header className="marketplace-ai-experience__header">
							<h2 className="marketplace-ai-experience__title">
								<span className="marketplace-ai-experience__icon" aria-hidden="true">
									✦
								</span>
								{ translate( 'Describe what you need' ) }
							</h2>
							<p className="marketplace-ai-experience__subtitle">
								{ translate( "We'll search the catalog and recommend the best results." ) }
							</p>
						</header>
						{ looking ? (
							loadingNode
						) : (
							<PromptForm onSubmit={ handlePromptSubmit } mode="initial" />
						) }
					</div>
				) }
			</div>
		</FullWidthSection>
	);
}
