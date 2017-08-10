/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import FileImporter from './file-importer';

/**
 * Module variables
 */
const importerData = {
	title: 'Medium',
	icon: 'medium',
};

export default React.createClass( {
	displayName: 'ImporterMedium',

	mixins: [ PureRenderMixin ],

	render: function() {
		importerData.description = this.translate(
			'Import posts, tags, images and videos ' + 'from a Medium export file.'
		);

		importerData.uploadDescription = this.translate(
			'Upload a {{b}}Medium export file{{/b}} to start ' + 'importing into {{b2}}%(title)s{{/b2}}.',
			{
				args: { title: this.props.site.title },
				components: {
					b: <strong />,
					b2: <strong />,
				},
			}
		);

		return <FileImporter importerData={ importerData } { ...this.props } />;
	},
} );
