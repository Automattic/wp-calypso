import { useTranslate } from 'i18n-calypso';
import type { BuildWowStreamView } from './use-build-wow-stream';

// What the live feed has decided so far, shown only for the capabilities the
// run advertises. Panels are chosen by capability, never by graph name, so a
// graph without planning events still shows progress and nothing it cannot
// back up. Generated markup (preview formats) is not rendered here.

function hasCapability( stream: BuildWowStreamView, capability: string ): boolean {
	return stream.info.capabilities.includes( capability );
}

export function BuildWowStreamBoard( { stream }: { stream: BuildWowStreamView } ) {
	const translate = useTranslate();
	const { state } = stream;
	const plan = state.plan;

	const showProgress = hasCapability( stream, 'progress' ) && state.currentStep;
	const showDirections = hasCapability( stream, 'planning' ) && state.directions.length > 0;
	const showPlan = hasCapability( stream, 'planning' ) && plan && ( plan.title || plan.direction );
	const palette = hasCapability( stream, 'design' ) ? ( plan?.palette ?? [] ) : [];
	const typography = hasCapability( stream, 'design' ) ? ( plan?.typography ?? [] ) : [];
	const pages = hasCapability( stream, 'planning' ) ? ( plan?.pages ?? [] ) : [];

	const plannedSections = pages.reduce( ( total, page ) => total + page.sections.length, 0 );
	const writtenSections = Object.values( state.sections ).reduce(
		( total, positions ) =>
			total +
			Object.values( positions ).filter(
				( section ) => section.kind === 'content' && ! section.partial
			).length,
		0
	);
	const showSections = hasCapability( stream, 'sections' ) && plannedSections > 0;

	const imageStatuses = Object.values( state.images );
	const readyImages = imageStatuses.filter( ( status ) => status === 'ready' ).length;
	const showImages = hasCapability( stream, 'images' ) && imageStatuses.length > 0;

	if (
		! showProgress &&
		! showDirections &&
		! showPlan &&
		! palette.length &&
		! typography.length &&
		! pages.length &&
		! showImages
	) {
		return null;
	}

	return (
		<section
			aria-label={ String( translate( 'What I’ve planned so far' ) ) }
			className="site-generation-stream"
		>
			{ showProgress && (
				<p className="site-generation-stream__step">
					{ translate( 'Now: %(step)s', {
						args: { step: state.currentStep as string },
						comment: 'The build step the AI site builder is working on right now.',
					} ) }
				</p>
			) }
			{ showDirections && ! showPlan && (
				<div className="site-generation-stream__group">
					<h2 className="site-generation-stream__heading">
						{ translate( 'Directions I’m exploring' ) }
					</h2>
					<ul className="site-generation-stream__list">
						{ state.directions.map( ( direction ) => (
							<li key={ direction }>{ direction }</li>
						) ) }
					</ul>
				</div>
			) }
			{ showPlan && plan && (
				<div className="site-generation-stream__group">
					<h2 className="site-generation-stream__heading">
						{ plan.status === 'completed'
							? translate( 'The plan' )
							: translate( 'Shaping the plan' ) }
					</h2>
					{ plan.title && <p className="site-generation-stream__title">{ plan.title }</p> }
					{ plan.direction && (
						<p className="site-generation-stream__direction">{ plan.direction }</p>
					) }
				</div>
			) }
			{ palette.length > 0 && (
				<div className="site-generation-stream__group">
					<h2 className="site-generation-stream__heading">{ translate( 'Colors' ) }</h2>
					<ul className="site-generation-stream__swatches">
						{ palette.map( ( swatch ) => (
							<li
								className="site-generation-stream__swatch"
								key={ `${ swatch.name }-${ swatch.color }` }
								style={ { backgroundColor: swatch.color } }
								title={ `${ swatch.name } ${ swatch.color }` }
							>
								<span className="screen-reader-text">{ `${ swatch.name } ${ swatch.color }` }</span>
							</li>
						) ) }
					</ul>
				</div>
			) }
			{ typography.length > 0 && (
				<div className="site-generation-stream__group">
					<h2 className="site-generation-stream__heading">{ translate( 'Fonts' ) }</h2>
					<ul className="site-generation-stream__list">
						{ typography.map( ( face ) => (
							<li key={ `${ face.role ?? face.name }-${ face.family }` }>
								{ face.role ? `${ face.role }: ${ face.family }` : face.family }
							</li>
						) ) }
					</ul>
				</div>
			) }
			{ pages.length > 0 && (
				<div className="site-generation-stream__group">
					<h2 className="site-generation-stream__heading">{ translate( 'Pages' ) }</h2>
					<ul className="site-generation-stream__list">
						{ pages.map( ( page ) => (
							<li key={ page.slug }>
								{ page.title }
								{ page.sections.length > 0 && (
									<span className="site-generation-stream__sections">
										{ page.sections.join( ' · ' ) }
									</span>
								) }
							</li>
						) ) }
					</ul>
					{ showSections && (
						<p className="site-generation-stream__count">
							{ translate( '%(written)d of %(planned)d sections written', {
								args: {
									written: Math.min( writtenSections, plannedSections ),
									planned: plannedSections,
								},
							} ) }
						</p>
					) }
				</div>
			) }
			{ showImages && (
				<p className="site-generation-stream__count">
					{ translate( '%(ready)d of %(total)d images ready', {
						args: { ready: readyImages, total: imageStatuses.length },
					} ) }
				</p>
			) }
		</section>
	);
}
