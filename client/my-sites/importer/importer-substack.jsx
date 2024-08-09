import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import importerConfig from 'calypso/lib/importer/importer-config';
import FileImporter from './file-importer';

class ImporterSubstack extends PureComponent {
	static displayName = 'ImporterSubstack';

	static propTypes = {
		site: PropTypes.shape( {
			title: PropTypes.string.isRequired,
		} ).isRequired,
		siteSlug: PropTypes.string.isRequired,
		siteTitle: PropTypes.string.isRequired,
		importerStatus: PropTypes.shape( {
			importerState: PropTypes.string.isRequired,
			errorData: PropTypes.shape( {
				type: PropTypes.string.isRequired,
				description: PropTypes.string.isRequired,
			} ),
			statusMessage: PropTypes.string,
		} ),
		fromSite: PropTypes.string,
		hideUploadDescription: PropTypes.bool,
	};

	render() {
		const importerData = importerConfig( {
			importerState: this.props.importerStatus.importerState,
			siteSlug: this.props.siteSlug,
			siteTitle: this.props.siteTitle,
		} ).substack;

		if ( this.props.hideUploadDescription ) {
			delete importerData.uploadDescription;
		}

		return <FileImporter importerData={ importerData } { ...this.props } />;
	}
}

export default localize( ImporterSubstack );
