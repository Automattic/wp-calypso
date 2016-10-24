/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import includes from 'lodash/includes';

/**
 * Internal dependencies
 */
import Button from 'components/forms/form-button';
import { appStates } from 'state/imports/constants';
import { cancelImport, resetImport, startImport } from 'lib/importer/actions';
import SocialLogo from 'components/social-logo';
import flowRight from 'lodash/flowRight';
import { connectDispatcher } from './dispatcher-converter';

/**
 * Module variables
 */
const startStates = [ appStates.DISABLED, appStates.INACTIVE ],
	cancelStates = [
		appStates.MAP_AUTHORS,
		appStates.READY_FOR_UPLOAD,
		appStates.UPLOAD_FAILURE,
		appStates.UPLOAD_SUCCESS,
		appStates.UPLOADING
	],
	stopStates = [ appStates.IMPORT_FAILURE, appStates.IMPORTING ],
	doneStates = [ appStates.IMPORT_SUCCESS ];

export const ImporterHeader = React.createClass( {
	displayName: 'ImporterHeader',

	mixins: [ PureRenderMixin ],

	propTypes: {
		importerStatus: PropTypes.shape( {
			importerState: PropTypes.string.isRequired,
			type: PropTypes.string.isRequired
		} ),
		description: PropTypes.string.isRequired,
		icon: PropTypes.string.isRequired,
		title: PropTypes.string.isRequired,
		isEnabled: PropTypes.bool.isRequired
	},

	controlButtonClicked: function() {
		const {
			importerStatus: {
				importerId,
				importerState,
				type
			},
			site: {
				ID: siteId
			},
			startImport
		} = this.props;

		if ( includes( [ ...cancelStates, ...stopStates ], importerState ) ) {
			cancelImport( siteId, importerId );
		} else if ( includes( startStates, importerState ) ) {
			startImport( siteId, type );
		} else if ( includes( doneStates, importerState ) ) {
			resetImport( siteId, importerId );
		}
	},

	getButtonText: function() {
		const { importerState } = this.props.importerStatus;

		if ( includes( startStates, importerState ) ) {
			return this.translate( 'Start Import', { context: 'verb' } );
		}

		if ( includes( cancelStates, importerState ) ) {
			return this.translate( 'Cancel', { context: 'verb' } );
		}

		if ( includes( stopStates, importerState ) ) {
			return this.translate( 'Stop Import', { context: 'verb' } );
		}

		if ( includes( doneStates, importerState ) ) {
			return this.translate( 'Done', { context: 'adjective' } );
		}
	},

	render: function() {
		const { importerStatus: { importerState }, icon, isEnabled, title, description } = this.props;
		const canCancel = isEnabled && ! includes( [ appStates.UPLOADING ], importerState );
		const isScary = includes( [ ...stopStates, ...cancelStates ], importerState );

		return (
			<header className="importer-service">
				{ includes( [ 'wordpress', 'medium' ], icon )
					? <SocialLogo className="importer__service-icon" icon={ icon } size={ 48 } />
					: <svg className="importer__service-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" /> }
				<Button
					className="importer__master-control"
					disabled={ ! canCancel }
					isPrimary={ false }
					scary={ isScary }
					onClick={ this.controlButtonClicked }
				>
					{ this.getButtonText() }
				</Button>
				<div className="importer__service-info">
					<h1 className="importer__service-title">{ title }</h1>
					<p>{ description }</p>
				</div>
			</header>
		);
	}
} );

const mapDispatchToProps = dispatch => ( {
	startImport: flowRight( dispatch, startImport )
} );

export default connectDispatcher( null, mapDispatchToProps )( ImporterHeader );
