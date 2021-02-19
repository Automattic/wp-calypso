/**
 * External dependencies
 */
import React, { useState } from 'react';
import { localize, LocalizeProps } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { url } from 'calypso/lib/media/utils';
import MediaFile from 'calypso/my-sites/media-library/media-file';

interface Props {
	className: string;
	component: string;
	item: { URL: string };
	site: { URL: string };
}

const EditorMediaModalDetailPreviewMediaFile: React.FC< Props & LocalizeProps > = ( {
	className,
	component,
	item,
	site,
	translate,
} ) => {
	const [ previewUnavailable, setPreviewUnavailable ] = useState( false );
	if ( previewUnavailable ) {
		// User may or may not be authenticated against their remote site - we need to go through the login page
		// to trigger SSO when available
		const fileUrl = `${ site.URL }/wp-login.php?redirect_to=${ item.URL }`;
		return (
			// eslint-disable-next-line wpcalypso/jsx-classname-namespace
			<div className="editor-media-modal-detail__preview is-too-large">
				{ translate( 'Preview unavailable, {{a}}click here to open the file directly{{/a}}.', {
					components: {
						a: <a rel="noopener noreferrer" target="_blank" href={ fileUrl } />,
					},
				} ) }
			</div>
		);
	}

	return (
		<MediaFile
			component={ component }
			src={ url( item, {} ) }
			maxSize={ 20 * 1024 * 1024 }
			onError={ () => setPreviewUnavailable( true ) }
			controls
			className={ className }
		/>
	);
};

export default localize( EditorMediaModalDetailPreviewMediaFile );
