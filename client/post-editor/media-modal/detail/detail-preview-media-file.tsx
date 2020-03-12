/**
 * External dependencies
 */
import React, { useState } from 'react';
import { localize, LocalizeProps } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { url } from 'lib/media/utils';
import MediaFile from 'my-sites/media-library/media-file';

interface Props {
	className: string;
	component: string;
	item: any;
	site: any;
}

const EditorMediaModalDetailPreviewMediaFile: React.FC< Props & LocalizeProps > = ( {
	className,
	component,
	item,
	site,
	translate,
} ) => {
	const [ tooLargeToDisplay, setTooLargeToDisplay ] = useState( false );
	if ( tooLargeToDisplay ) {
		// User may or may not be authenticated against their remote site - we need to go through the login page
		// to trigger SSO when available
		const fileUrl = `${ site.URL }/wp-login.php?${ item.URL }`;
		return (
			// eslint-disable-next-line wpcalypso/jsx-classname-namespace
			<div className="editor-media-modal-detail__preview is-too-large">
				{ translate( 'Preview unavailable, {{a}}click here to open the file directly{{/a}}.', {
					components: {
						a: <a href={ fileUrl } />,
					},
				} ) }
			</div>
		);
	}

	return (
		<MediaFile
			component={ component }
			src={ url( item, {} ) }
			maxSize={ 20000 }
			onMaxSizeExceeded={ () => setTooLargeToDisplay( true ) }
			controls
			className={ className }
		/>
	);
};

export default localize( EditorMediaModalDetailPreviewMediaFile );
