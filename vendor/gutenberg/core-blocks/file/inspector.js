/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	PanelBody,
	SelectControl,
	ToggleControl,
} from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import { InspectorControls } from '@wordpress/editor';

function getDownloadButtonHelp( checked ) {
	return checked ? __( 'The download button is shown.' ) : __( 'The download button is hidden.' );
}

export default function FileBlockInspector( {
	hrefs,
	openInNewWindow,
	showDownloadButton,
	changeLinkDestinationOption,
	changeOpenInNewWindow,
	changeShowDownloadButton,
} ) {
	const { href, textLinkHref, attachmentPage } = hrefs;

	let linkDestinationOptions = [ { value: href, label: __( 'URL' ) } ];
	if ( attachmentPage ) {
		linkDestinationOptions = [
			{ value: href, label: __( 'Media File' ) },
			{ value: attachmentPage, label: __( 'Attachment Page' ) },
		];
	}

	return (
		<Fragment>
			<InspectorControls>
				<PanelBody title={ __( 'Text Link Settings' ) }>
					<SelectControl
						label={ __( 'Link To' ) }
						value={ textLinkHref }
						options={ linkDestinationOptions }
						onChange={ changeLinkDestinationOption }
					/>
					<ToggleControl
						label={ __( 'Open in New Window' ) }
						checked={ openInNewWindow }
						onChange={ changeOpenInNewWindow }
					/>
				</PanelBody>
				<PanelBody title={ __( 'Download Button Settings' ) }>
					<ToggleControl
						label={ __( 'Show Download Button' ) }
						help={ getDownloadButtonHelp }
						checked={ showDownloadButton }
						onChange={ changeShowDownloadButton }
					/>
				</PanelBody>
			</InspectorControls>
		</Fragment>
	);
}
