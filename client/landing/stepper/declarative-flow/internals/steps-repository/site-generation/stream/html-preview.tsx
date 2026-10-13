import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import { htmlPreviewDocument } from './html-preview-document';
import { useBuildHtmlPreview } from './use-build-html-preview';
import type { BuildWowStreamView } from './use-build-wow-stream';

export function BuildHtmlPreview( { stream }: { stream: BuildWowStreamView } ) {
	const translate = useTranslate();
	const [ selectedRoute, setSelectedRoute ] = useState( '/' );
	const previews = Object.values( stream.state.previews );
	const reference = stream.state.previews[ selectedRoute ] ?? previews[ 0 ];
	const { html, failed } = useBuildHtmlPreview( reference, stream );
	const srcDoc = useMemo(
		() => ( html === null ? undefined : htmlPreviewDocument( html ) ),
		[ html ]
	);

	return (
		<div className="site-generation-live__html-preview">
			<label>
				{ translate( 'Page preview' ) }
				<select
					value={ reference?.route ?? '' }
					onChange={ ( event ) => setSelectedRoute( event.target.value ) }
					disabled={ previews.length === 0 }
				>
					{ previews.map( ( preview ) => (
						<option key={ preview.route } value={ preview.route }>
							{ preview.route }
						</option>
					) ) }
				</select>
			</label>
			{ srcDoc !== undefined ? (
				<iframe
					title={ String( translate( 'Site preview' ) ) }
					sandbox=""
					referrerPolicy="no-referrer"
					srcDoc={ srcDoc }
				/>
			) : (
				<p role="status">{ translate( 'Your page will appear as it is generated.' ) }</p>
			) }
			{ failed && <p role="status">{ translate( 'The preview could not be updated.' ) }</p> }
		</div>
	);
}
