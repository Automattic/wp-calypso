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
	title: 'Medium',
	icon: 'medium'
};

export default React.createClass( {
	displayName: 'ImporterMedium',

	mixins: [ React.addons.PureRenderMixin ],

	render: function() {
		importerData.description = this.translate( 'Import posts from a Medium export file.' );

		return <FileImporter importerData={ importerData } {...this.props} />;
	}
} );
