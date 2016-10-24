/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import classNames from 'classnames';
import includes from 'lodash/includes';

/**
 * Internal dependencies
 */
import { appStates } from 'state/imports/constants';
import Card from 'components/card';
import ErrorPane from './error-pane';
import ImporterHeader from './importer-header';
import ImportingPane from './importing-pane';
import UploadingPane from './uploading-pane';

/**
 * Module variables
 */
const compactStates = [ appStates.DISABLED, appStates.INACTIVE ],
	importingStates = [
		appStates.IMPORT_FAILURE,
		appStates.IMPORT_SUCCESS,
		appStates.IMPORTING,
		appStates.MAP_AUTHORS
	],
	uploadingStates = [
		appStates.READY_FOR_UPLOAD,
		appStates.UPLOAD_FAILURE,
		appStates.UPLOAD_SUCCESS,
		appStates.UPLOADING
	];

export default React.createClass( {
	displayName: 'FileImporter',

	mixins: [ PureRenderMixin ],

	propTypes: {
		importerData: PropTypes.shape( {
			title: PropTypes.string.isRequired,
			icon: PropTypes.string.isRequired,
			description: PropTypes.oneOfType( [ PropTypes.string, PropTypes.node ] ).isRequired,
			uploadDescription: PropTypes.oneOfType( [
				PropTypes.string,
				PropTypes.node
			] )
		} ).isRequired,
		importerStatus: PropTypes.shape( {
			errorData: PropTypes.shape( {
				type: PropTypes.string.isRequired,
				description: PropTypes.string.isRequired
			} ),
			filename: PropTypes.string,
			importerState: PropTypes.string.isRequired,
			percentComplete: PropTypes.number,
			siteTitle: PropTypes.string.isRequired,
			statusMessage: PropTypes.string
		} )
	},

	render: function() {
		const { title, icon, description, uploadDescription } = this.props.importerData;
		const site = this.props.site;
		const state = this.props.importerStatus,
			isEnabled = ( appStates.DISABLED !== state.importerState ),
			cardClasses = classNames( 'importer__shell', {
				'is-compact': includes( compactStates, state.importerState ),
				'is-disabled': ! isEnabled
			} );

		return (
			<Card className={ cardClasses }>
				<ImporterHeader importerStatus={ state } {...{ icon, title, description, isEnabled, site } } />
				{ state.errorData &&
					<ErrorPane type={ state.errorData.type } description={ state.errorData.description } />
				}
				{ includes( importingStates, state.importerState ) &&
					<ImportingPane importerStatus={ state } site={ this.props.site } />
				}
				{ includes( uploadingStates, state.importerState ) &&
					<UploadingPane description={ uploadDescription } importerStatus={ state } />
				}
			</Card>
		);
	}
} );
