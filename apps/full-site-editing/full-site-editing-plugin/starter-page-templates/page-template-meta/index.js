/**
 * External dependencies
 */
import { registerPlugin } from '@wordpress/plugins';
import { PluginSidebar } from '@wordpress/edit-post';
import { __ } from '@wordpress/i18n';
import { PanelBody } from '@wordpress/components';

/**
 * Internal dependencies
 */
import MetaField from './components/meta-field';

export const Sidebar = () => {
	return (
		<PluginSidebar
			name="fse-spt-sidebar"
			title={ __( 'Starter Page Templates' ) }
			icon="wordpress-alt"
		>
			<PanelBody title="Template Preview Details">
				<MetaField label="Preview URL" inputType="url" metaFieldKey="hs_template_preview" />

				<MetaField
					label="Preview Description"
					type="textarea"
					metaFieldKey="hs_template_description"
				/>
			</PanelBody>
		</PluginSidebar>
	);
};

if ( window.starterPageTemplatesConfig.showMeta ) {
	registerPlugin( 'page-templates-sidebar', {
		render: function() {
			return <Sidebar />;
		},
	} );
}
