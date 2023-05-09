import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import importerConfig from 'calypso/lib/importer/importer-config';
import FileImporter from './file-importer';

class ImporterWordPress extends PureComponent {
	static displayName = 'ImporterWordPress';

	static propTypes = {
		siteTitle: PropTypes.string.isRequired,
		isAtomic: PropTypes.bool,
		isJetpack: PropTypes.bool,
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
			isAtomic: this.props.isAtomic,
			isJetpack: this.props.isJetpack,
		} ).wordpress;

		return <FileImporter importerData={ importerData } { ...this.props } />;
	}
}

export default localize( ImporterWordPress );
