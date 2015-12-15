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
	icon: 'medium'
};

export default React.createClass( {
	displayName: 'ImporterMedium',

	mixins: [ PureRenderMixin ],

	render: function() {
		importerData.description = this.translate( 'Import posts from a Medium export file.' );

		return <FileImporter importerData={ importerData } {...this.props} />;
	}
} );
