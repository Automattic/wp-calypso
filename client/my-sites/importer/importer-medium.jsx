import { localize } from 'i18n-calypso';
import { PureComponent } from 'react';
import importerConfig from 'calypso/lib/importer/importer-config';
import FileImporter from './file-importer';

class ImporterMedium extends PureComponent {
	static displayName = 'ImporterMedium';

	render() {
		const importerData = importerConfig( {
			siteTitle: this.props.siteTitle,
		} ).medium;

		return <FileImporter importerData={ importerData } { ...this.props } />;
	}
}

export default localize( ImporterMedium );
