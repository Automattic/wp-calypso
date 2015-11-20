/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import FileImporter from './file-importer';

/**
 * Module variables
 */
const importerData = {
	title: 'Squarespace',
	icon: 'squarespace'
};

export default React.createClass( {
	displayName: 'ImporterSquarespace',

	mixins: [ React.addons.PureRenderMixin ],

	render: function() {
		importerData.description = this.translate(
			'Import posts, comments, images, and tags ' +
			'from a Squarespace export file.'
		);

		return <FileImporter importerData={ importerData } {...this.props} />;
	}
} );
