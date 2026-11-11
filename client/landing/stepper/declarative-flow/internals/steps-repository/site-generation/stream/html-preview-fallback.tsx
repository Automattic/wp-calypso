import { __, sprintf } from '@wordpress/i18n';
import { useMemo } from 'react';
import { htmlPreviewDocument, preparePreviewDocument } from './html-preview-document';
import { useBuildHtmlPreview } from './use-build-html-preview';
import type { StreamPreview } from './reducer';
import type { BuildWowStreamView } from './use-build-wow-stream';

import './html-preview-fallback.scss';

function FallbackPage( {
	stream,
	reference,
	title,
	primary = false,
}: {
	stream: BuildWowStreamView;
	reference?: StreamPreview;
	title: string;
	primary?: boolean;
} ) {
	const { html, assets, failed } = useBuildHtmlPreview( reference, stream );
	const srcDoc = useMemo( () => {
		if ( html === null || ! preparePreviewDocument( html, assets )?.meaningful ) {
			return null;
		}
		return htmlPreviewDocument( html, assets );
	}, [ html, assets ] );

	if ( ! primary && srcDoc === null ) {
		return null;
	}

	return (
		<section
			className="site-generation-preview-fallback__page"
			data-primary={ primary || undefined }
		>
			<h3>{ title }</h3>
			{ srcDoc !== null ? (
				<iframe
					title={ sprintf(
						/* translators: %s: page title. */
						__( '%s — static preview' ),
						title
					) }
					sandbox=""
					referrerPolicy="no-referrer"
					srcDoc={ srcDoc }
				/>
			) : (
				<p role="status">{ __( 'Your homepage preview will appear when it is available.' ) }</p>
			) }
			{ failed && srcDoc !== null && (
				<p role="status">
					{ __( 'This preview could not be updated. Showing the last available version.' ) }
				</p>
			) }
		</section>
	);
}

export function BuildHtmlPreviewFallback( { stream }: { stream: BuildWowStreamView } ) {
	const pages = useMemo( () => {
		const titles = new Map< string, string >();
		for ( const page of stream.state.plan?.pages ?? [] ) {
			const slug = page.slug.replace( /^\/+|\/+$/g, '' );
			if ( slug !== 'home' && /^[\w-]+$/.test( slug ) ) {
				titles.set( `/${ slug }/`, page.title );
			}
		}
		return Object.values( stream.state.previews )
			.filter( ( reference ) => reference.route !== '/' && titles.has( reference.route ) )
			.slice( 0, 23 )
			.map( ( reference ) => ( { reference, title: titles.get( reference.route )! } ) );
	}, [ stream.state.plan?.pages, stream.state.previews ] );
	const identity = `${ stream.info.blogId }:${ stream.info.runId }:${ stream.state.attempt }`;
	const homepage = stream.state.previews[ '/' ];

	return (
		<div className="site-generation-preview-fallback" aria-label={ __( 'Static site preview' ) }>
			<p className="site-generation-preview-fallback__notice" role="status">
				{ __( 'Showing a simplified preview of your site.' ) }
			</p>
			<div className="site-generation-preview-fallback__pages">
				<FallbackPage
					key={ `${ identity }:/:${ homepage?.epoch ?? '' }` }
					primary
					reference={ homepage }
					stream={ stream }
					title={ __( 'Homepage' ) }
				/>
				{ pages.map( ( page ) => (
					<FallbackPage
						key={ `${ identity }:${ page.reference.route }:${ page.reference.epoch }` }
						{ ...page }
						stream={ stream }
					/>
				) ) }
			</div>
		</div>
	);
}
