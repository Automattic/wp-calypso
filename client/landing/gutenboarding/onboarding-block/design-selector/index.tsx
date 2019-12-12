/**
 * External dependencies
 */
import { __ as NO__ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import React, { useState } from 'react';

/**
 * Internal dependencies
 */
import { SiteVertical } from '../../stores/onboard/types';
import { TemplateSelector } from '@automattic/components';

export default () => {
	const siteVertical = useSelect(
		select => select( 'automattic/onboard' ).getState().siteVertical as SiteVertical
	);

	const templates =
		useSelect( select =>
			select( 'automattic/verticals/templates' ).getTemplates( siteVertical.id )
		) ?? [];

	const homepageTemplates = templates.filter( template => template.category === 'home' );

	const [ previewedTemplate, setPreviewedTemplate ] = useState< string | null >( null );
	return (
		<div
			className="page-template-modal__list" // eslint-disable-line wpcalypso/jsx-classname-namespace
		>
			<TemplateSelector
				label={ NO__( 'Layout', 'full-site-editing' ) }
				templates={ homepageTemplates }
				blocksByTemplates={ {} /* Unneeded, since we're setting `useDynamicPreview` to `false` */ }
				onTemplateSelect={ setPreviewedTemplate }
				useDynamicPreview={ false }
				siteInformation={ undefined }
				selectedTemplate={ previewedTemplate }
				// handleTemplateConfirmation={ this.handleConfirmation }
			/>
		</div>
	);
};
