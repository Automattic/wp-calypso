import { localize } from 'i18n-calypso';
import { PureComponent } from 'react';
import importerConfig from 'calypso/lib/importer/importer-config';
import FileImporter from './file-importer';

class ImporterInstagram extends PureComponent {
	static displayName = 'ImporterInstagram';

	render() {
		const importerData = importerConfig( {
			siteTitle: this.props.siteTitle,
		} ).instagram;

		return <FileImporter importerData={ importerData } { ...this.props } />;
	}
}

export default localize( ImporterInstagram );
