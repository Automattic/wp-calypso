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
	title: 'Ghost',
	icon: 'ghost'
};

export default React.createClass( {
	displayName: 'ImporterGhost',

	mixins: [ React.addons.PureRenderMixin ],

	render: function() {
		importerData.description = this.translate( 'Import posts and tags from a Ghost export file.' );

		return <FileImporter importerData={ importerData } {...this.props} />;
	}
} );
