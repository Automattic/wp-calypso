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
		siteTitle: PropTypes.string.isRequired,
		importerStatus: PropTypes.shape( {
			importerState: PropTypes.string.isRequired,
			errorData: PropTypes.shape( {
				type: PropTypes.string.isRequired,
				description: PropTypes.string.isRequired,
			} ),
			statusMessage: PropTypes.string,
		} ),
	};

	render() {
		const importerData = importerConfig( {
			siteTitle: this.props.siteTitle,
		} ).substack;

		return <FileImporter importerData={ importerData } { ...this.props } />;
	}
}

export default localize( ImporterSubstack );
