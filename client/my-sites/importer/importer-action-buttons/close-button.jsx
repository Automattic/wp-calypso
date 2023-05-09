import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { cancelImport } from 'calypso/state/imports/actions';
import { appStates } from 'calypso/state/imports/constants';
import ImporterActionButton from './action-button';

export class ImporterCloseButton extends PureComponent {
	static displayName = 'ImporterCloseButton';

	static propTypes = {
		importerStatus: PropTypes.shape( {
			importerId: PropTypes.string.isRequired,
			importerState: PropTypes.string.isRequired,
			type: PropTypes.string.isRequired,
		} ),
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
		} ),
		isEnabled: PropTypes.bool.isRequired,
	};

	handleClick = () => {
		const {
			importerStatus: { importerId, type },
			site: { ID: siteId },
		} = this.props;

		this.props.cancelImport( siteId, importerId );

		this.props.recordTracksEvent( 'calypso_importer_main_cancel_clicked', {
			blog_id: siteId,
			importer_id: type,
		} );
	};

	render() {
		const {
			importerStatus: { importerState },
			isEnabled,
			isUploading,
			translate,
		} = this.props;

		const disabled = ! isEnabled || isUploading || appStates.UPLOADING === importerState;

		return (
			<ImporterActionButton disabled={ disabled } onClick={ this.handleClick }>
				{ translate( 'Cancel', { context: 'verb, to Cancel an operation' } ) }
			</ImporterActionButton>
		);
	}
}

export default connect( null, { recordTracksEvent, cancelImport } )(
	localize( ImporterCloseButton )
);
