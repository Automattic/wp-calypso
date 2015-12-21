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
	title: 'Squarespace',
	icon: 'squarespace'
};

export default React.createClass( {
	displayName: 'ImporterSquarespace',

	mixins: [ PureRenderMixin ],

	render: function() {
		importerData.description = this.translate(
			'Import posts, comments, images, and tags ' +
			'from a Squarespace export file.'
		);

		return <FileImporter importerData={ importerData } {...this.props} />;
	}
} );
