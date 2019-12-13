/**
 * External dependencies
 */
import { __ as NO__ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useSelect } from '@wordpress/data';
import React, { useState } from 'react';

/**
 * Internal dependencies
 */
import { SiteVertical } from '../../stores/onboard/types';
import { TemplateSelectorControl } from '../../../../../apps/full-site-editing/full-site-editing-plugin/starter-page-templates/page-template-modal/components/template-selector-control';

import './style.scss';

export default () => {
	const siteVertical = useSelect(
		select => select( 'automattic/onboard' ).getState().siteVertical as SiteVertical
	);

	const templates =
		useSelect( select =>
			select( 'automattic/verticals/templates' ).getTemplates( siteVertical.id )
		) ?? [];

	// The templates' preview URLs come with a hard-wired size param (`?w=332`)
	// that isn't high-res enough for our purposes. Thus, we override it here.
	// TODO: Maybe add a `srcset` to `TemplateSelectorItem`.
	const templatesWithResizedThumbnails = templates.map( template => ( {
		...template,
		preview: addQueryArgs( template.preview, { w: 960 / 2 } ),
	} ) );

	const homepageTemplates = templatesWithResizedThumbnails.filter(
		template => template.category === 'home'
	);

	const [ previewedTemplate, setPreviewedTemplate ] = useState< string | null >( null );
	return (
		<div
			className="onboarding-block__design-selector" // eslint-disable-line wpcalypso/jsx-classname-namespace
		>
			<h1>{ NO__( 'Choose a starting design for your site' ) }</h1>
			<h2>{ NO__( "You'll be able to customize your new site in hundreds of ways." ) }</h2>
			<div
				className=" page-template-modal__list" // eslint-disable-line wpcalypso/jsx-classname-namespace
			>
				<TemplateSelectorControl
					label={ NO__( 'Layout', 'full-site-editing' ) }
					templates={ homepageTemplates }
					blocksByTemplates={
						{} /* Unneeded, since we're setting `useDynamicPreview` to `false` */
					}
					onTemplateSelect={ setPreviewedTemplate }
					useDynamicPreview={ false }
					siteInformation={ undefined }
					selectedTemplate={ previewedTemplate }
				/>
			</div>
		</div>
	);
};
