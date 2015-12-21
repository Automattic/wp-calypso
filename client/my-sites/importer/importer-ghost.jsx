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
	title: 'Ghost',
	icon: 'ghost'
};

export default React.createClass( {
	displayName: 'ImporterGhost',

	mixins: [ PureRenderMixin ],

	render: function() {
		importerData.description = this.translate( 'Import posts and tags from a Ghost export file.' );

		return <FileImporter importerData={ importerData } {...this.props} />;
	}
} );
