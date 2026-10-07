import { Icon } from '@wordpress/components';
import { wordpress } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import type { BuildWowStreamView } from './use-build-wow-stream';
import type { CSSProperties } from 'react';

function hasCapability( stream: BuildWowStreamView, capability: string ): boolean {
	return stream.info.capabilities.includes( capability );
}

/** A live, read-only canvas built only from data this graph has streamed. */
export function BuildWowStreamCanvas( {
	stream,
	activityLabel,
}: {
	stream: BuildWowStreamView;
	activityLabel?: string;
} ) {
	const translate = useTranslate();
	const { info, state } = stream;
	const plan = state.plan;
	// Older Build Wow hosts may advertise only `progress` while still forwarding
	// the Engine's structured plan fields. Render those fields when present; the
	// payload itself is the evidence, and this UI never renders generated markup.
	const canPlan = hasCapability( stream, 'planning' ) || Boolean( plan?.direction || plan?.pages );
	const canDesign =
		hasCapability( stream, 'design' ) ||
		Boolean( plan?.palette?.length || plan?.typography?.length );
	const canShowSections = hasCapability( stream, 'sections' );
	const directions = canPlan ? state.directions : [];
	const palette = canDesign ? ( plan?.palette ?? [] ) : [];
	const typography = canDesign ? ( plan?.typography ?? [] ) : [];
	const pages = canPlan ? ( plan?.pages ?? [] ) : [];
	const imageStatuses = Object.values( state.images );
	const readyImages = imageStatuses.filter( ( status ) => status === 'ready' ).length;
	const sections = canShowSections
		? Object.values( state.sections )
				.flatMap( ( positions ) => Object.values( positions ) )
				.filter( ( section ) => section.kind === 'content' && section.name )
				.map( ( section ) => ( { name: section.name as string, partial: section.partial } ) )
		: [];
	const currentStep = state.currentStep ?? activityLabel ?? translate( 'Getting the build ready' );

	return (
		<section
			aria-label={ String( translate( 'Live site build' ) ) }
			className="site-generation-live"
			data-capability-design={ canDesign }
			data-capability-planning={ canPlan }
		>
			<div className="site-generation-live__toolbar">
				<span className="site-generation-live__brand" aria-hidden="true">
					<Icon icon={ wordpress } size={ 18 } />
				</span>
				<span className="site-generation-live__graph">
					{ info.graph
						? translate( '%(graph)s build', { args: { graph: info.graph } } )
						: translate( 'Site build' ) }
				</span>
				<span className="site-generation-live__pulse" aria-hidden="true" />
				<span className="site-generation-live__live-label">{ translate( 'Live' ) }</span>
			</div>

			<div className="site-generation-live__content">
				<h2 className="site-generation-live__title">
					{ plan?.title ?? translate( 'Your site is taking shape' ) }
				</h2>
				{ plan?.direction && canPlan && (
					<p className="site-generation-live__direction">{ plan.direction }</p>
				) }
				{ directions.length > 0 && ! plan?.direction && (
					<p className="site-generation-live__direction">{ directions.join( ' · ' ) }</p>
				) }

				{ palette.length > 0 && (
					<ul
						className="site-generation-live__palette"
						aria-label={ String( translate( 'Emerging color palette' ) ) }
					>
						{ palette.map( ( swatch ) => (
							<li
								aria-label={ `${ swatch.name }, ${ swatch.color }` }
								className="site-generation-live__swatch"
								key={ `${ swatch.name }-${ swatch.color }` }
								style={ { '--stream-swatch': swatch.color } as CSSProperties }
								title={ `${ swatch.name } ${ swatch.color }` }
							/>
						) ) }
					</ul>
				) }

				{ typography.length > 0 && (
					<p className="site-generation-live__type">
						{ typography.map( ( face ) => face.family ).join( ' · ' ) }
					</p>
				) }
				{ imageStatuses.length > 0 && (
					<p className="site-generation-live__type">
						{ translate( '%(ready)d of %(total)d images ready', {
							args: { ready: readyImages, total: imageStatuses.length },
						} ) }
					</p>
				) }

				{ ( pages.length > 0 || sections.length > 0 ) && (
					<div className="site-generation-live__structure">
						{ pages.map( ( page ) => (
							<div className="site-generation-live__page" key={ page.slug }>
								<strong>{ page.title }</strong>
								{ page.sections.length > 0 && <span>{ page.sections.join( ' · ' ) }</span> }
							</div>
						) ) }
						{ sections.map( ( section, index ) => (
							<div
								className="site-generation-live__section"
								data-partial={ section.partial }
								key={ `${ section.name }-${ index }` }
							>
								<span>{ section.name }</span>
								<span>{ section.partial ? translate( 'In progress' ) : translate( 'Added' ) }</span>
							</div>
						) ) }
					</div>
				) }
			</div>

			<div aria-live="polite" className="site-generation-live__activity" role="status">
				<span className="site-generation-live__activity-mark" aria-hidden="true" />
				<span>{ currentStep }</span>
			</div>
		</section>
	);
}
