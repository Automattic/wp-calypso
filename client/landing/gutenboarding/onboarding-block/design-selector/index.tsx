/**
 * External dependencies
 */
import { __ as NO__ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import React, { FunctionComponent, useState } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { SiteVertical } from '../../stores/onboard/types';
import { TemplateSelectorControl } from '../../../../../apps/full-site-editing/full-site-editing-plugin/starter-page-templates/page-template-modal/components/template-selector-control';

import '../../../apps/full-site-editing/full-site-editing-plugin/starter-page-templates/page-template-modal/styles/starter-page-templates-editor.scss';

interface DesignSelectorProps {
	className: string;
}

const DesignSelector: FunctionComponent< DesignSelectorProps > = ( { className } ) => {
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
		<div className={ classNames( 'page-template-modal__list', className ) }>
			<TemplateSelectorControl
				label={ NO__( 'Layout', 'full-site-editing' ) }
				templates={ homepageTemplates }
				blocksByTemplates={ {} /* Unneeded, since we're setting `useDynamicPreview` to `false` */ }
				onTemplateSelect={ setPreviewedTemplate }
				useDynamicPreview={ false }
				siteInformation={ undefined }
				selectedTemplate={ previewedTemplate }
			/>
		</div>
	);
};

export default DesignSelector;
