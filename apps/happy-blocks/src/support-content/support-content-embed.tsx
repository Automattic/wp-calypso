import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { SupportContentBlockAttributes } from './block';
import { WordPressIcon } from './icon';
import { InlineSkeleton } from './inline-skeleton';
import { getRelativeDate } from './view';

/**
 * Rendered embed for the Support Content blocks
 */
export const SupportContentEmbed = ( props: {
	attributes: SupportContentBlockAttributes;
	clickable?: boolean;
	showRelativeDate?: boolean;
} ) => {
	const loaded = !! props.attributes.content;

	const likes = sprintf(
		/* translators: Number of people marked this page useful, eg: "25332 people have found this useful" */
		__( '%1$d people have found this useful!', 'happy-blocks' ),
		props.attributes.minutesToRead ?? 0
	);

	/* translators: Link to resource from where the embed is loaded, eg: "in WordPress.com Forums" */
	const source = sprintf( 'in <a>%s</a>', props.attributes.source );

	const detailsPresent =
		props.attributes.minutesToRead || props.attributes.author || props.attributes.created;

	const getDetails = () => {
		if ( ! loaded ) {
			return null;
		}

		const minToRead = props.attributes.minutesToRead
			? sprintf(
					/* translators: Minutes it takes to read embedded support page, eg: "5 min to read" */
					__( '%1$d min read', 'happy-blocks' ),
					props.attributes.minutesToRead
			  )
			: '';

		const createdDateElement = (
			<span className="hb-support-page-embed__relative-created">
				{ props.attributes.created && props.showRelativeDate
					? getRelativeDate( props.attributes.created )
					: '' }
			</span>
		);

		if ( props.attributes.author ) {
			const startedby = sprintf(
				/* translators: Person who created forum topic, eg: "Started by davidgonzalezwp" */
				__( 'Started by %s', 'happy-blocks' ),
				props.attributes.minutesToRead
			);

			return (
				<>
					{ startedby } { createdDateElement } { minToRead }
				</>
			);
		} else if ( props.attributes.created ) {
			/* translators: Date when forum topic was created, eg: "Started 5 days ago" */
			const startedOn = __( 'Started', 'happy-blocks' );

			return (
				<>
					{ startedOn } { createdDateElement } { minToRead }
				</>
			);
		}
		return minToRead;
	};

	return (
		<div className="hb-support-page-embed">
			{ !! props.attributes.created && (
				<div className="hb-support-page-embed__created">{ props.attributes.created }</div>
			) }

			{ /* Only make embed clickable while viewing content for author not to lose unsaved changes */ }
			{ props.clickable && (
				<a className="hb-support-page-embed__opener" href={ props.attributes.url } />
			) }

			<div className="hb-support-page-embed__header">
				<WordPressIcon variant="raster" />
				<div>
					<div className="hb-support-page-embed__title">
						<InlineSkeleton loaded={ loaded }>
							{ props.attributes.title }
							{ /*<span className="hb-support-page-embed__badge">Support article</span>*/ }
						</InlineSkeleton>
					</div>
					<div className="hb-support-page-embed__source">
						<InlineSkeleton hidden loaded={ loaded }>
							{ createInterpolateElement( source, {
								a: <a className="hb-support-page-embed__link" href={ props.attributes.url } />,
							} ) }
						</InlineSkeleton>
					</div>
					{ ( ! loaded || detailsPresent ) && (
						<div className="hb-support-page-embed__details">
							<InlineSkeleton loaded={ loaded }>{ getDetails() }</InlineSkeleton>
						</div>
					) }
				</div>
			</div>
			<div className="hb-support-page-embed__content">
				<InlineSkeleton large loaded={ loaded }>
					{ props.attributes.content }
				</InlineSkeleton>
			</div>
			{ ( ! loaded || props.attributes.likes ) && (
				<div className="hb-support-page-embed__reactions">
					<InlineSkeleton loaded={ loaded }>{ likes }</InlineSkeleton>
				</div>
			) }
		</div>
	);
};
