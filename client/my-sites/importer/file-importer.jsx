/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import { includes } from 'lodash';

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
		appStates.MAP_AUTHORS,
	],
	uploadingStates = [
		appStates.UPLOAD_PROCESSING,
		appStates.READY_FOR_UPLOAD,
		appStates.UPLOAD_FAILURE,
		appStates.UPLOAD_SUCCESS,
		appStates.UPLOADING,
	];

export default class extends React.PureComponent {
	static displayName = 'FileImporter';

	static propTypes = {
		importerData: PropTypes.shape( {
			title: PropTypes.string.isRequired,
			icon: PropTypes.string.isRequired,
			description: PropTypes.oneOfType( [ PropTypes.string, PropTypes.node ] ).isRequired,
			uploadDescription: PropTypes.oneOfType( [ PropTypes.string, PropTypes.node ] ),
		} ).isRequired,
		importerStatus: PropTypes.shape( {
			errorData: PropTypes.shape( {
				type: PropTypes.string.isRequired,
				description: PropTypes.string.isRequired,
			} ),
			importerState: PropTypes.string.isRequired,
			siteTitle: PropTypes.string.isRequired,
			statusMessage: PropTypes.string,
		} ),
	};

	render() {
		const { title, icon, description, uploadDescription } = this.props.importerData;
		const { importerStatus, site } = this.props;
		const { errorData, importerState } = importerStatus;
		const isEnabled = appStates.DISABLED !== importerState;
		const cardClasses = classNames( 'importer__shell', {
			'is-compact': includes( compactStates, importerState ),
			'is-disabled': ! isEnabled,
		} );

		return (
			<Card className={ cardClasses }>
				<ImporterHeader
					importerStatus={ importerStatus }
					{ ...{ icon, title, description, isEnabled, site } }
				/>
				{ errorData && <ErrorPane type={ errorData.type } description={ errorData.description } /> }
				{ includes( importingStates, importerState ) && (
					<ImportingPane importerStatus={ importerStatus } sourceType={ title } site={ site } />
				) }
				{ includes( uploadingStates, importerState ) && (
					<UploadingPane
						isEnabled={ isEnabled }
						description={ uploadDescription }
						importerStatus={ importerStatus }
						site={ site }
					/>
				) }
			</Card>
		);
	}
}
