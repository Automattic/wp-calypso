/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import FileImporter from './file-importer';
import UsersStore from 'lib/users/store';

/**
 * Module variables
 */
const importerData = {
	title: 'WordPress',
	icon: 'wordpress'
};

const fetchSiteUserCount = siteId => {
	UsersStore.getPaginationData( {
		order: 'ASC',
		order_by: 'display_name',
		number: 50,
		siteId
	} );

	console.log( 'Fetched user info' );
};

export default React.createClass( {
	displayName: 'ImporterWordPress',

	mixins: [ PureRenderMixin ],

	propTypes: {
		importerStatus: PropTypes.shape( {
			filename: PropTypes.string,
			importerState: PropTypes.string.isRequired,
			errorData: PropTypes.shape( {
				type: PropTypes.string.isRequired,
				description: PropTypes.string.isRequired
			} ),
			percentComplete: PropTypes.number,
			siteTitle: PropTypes.string.isRequired,
			statusMessage: PropTypes.string
		} )
	},

	componentDidMount() {
		const { siteId } = this.props;

		console.log( 'Mounting' );
		fetchSiteUserCount( siteId );
	},

	componentDidUpdate( { prevSiteId } ) {
		const { siteId } = this.props;

		if ( siteId !== prevSiteId ) {
			fetchSiteUserCount( siteId );
		}
	},

	render: function() {
		importerData.description = this.translate(
			'Import posts, pages, and media ' +
			'from a WordPress export file.'
		);

		importerData.uploadDescription = this.translate(
			'Upload a {{b}}WordPress export file{{/b}} to start ' +
			'importing into {{b2}}%(title)s{{/b2}}. Check out our ' +
			'{{a}}WordPress export guide{{/a}} if you need ' +
			'help exporting the file.', {
				args: { title: this.props.site.title },
				components: {
					b: <strong />,
					b2: <strong />,
					a: <a href="https://en.support.wordpress.com/export/" />
				}
			}
		);

		return <FileImporter importerData={ importerData } {...this.props} />;
	}
} );
