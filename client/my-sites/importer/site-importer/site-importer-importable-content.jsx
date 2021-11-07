import { localize } from 'i18n-calypso';
import { isEmpty, map } from 'lodash';
import PropTypes from 'prop-types';
import { Fragment } from 'react';

import './site-importer-importable-content.scss';

const SiteImporterImportableContent = ( { translate, importData = {} } ) => (
	<div className="site-importer__site-preview-import-content">
		{ ! isEmpty( importData.supported ) && (
			<Fragment>
				<p>{ translate( 'We will import:' ) }</p>
				<ul>
					{ map( importData.supported, ( supportedApp, index ) => (
						<li key={ index + supportedApp }>{ supportedApp }</li>
					) ) }
				</ul>
			</Fragment>
		) }
	</div>
);

SiteImporterImportableContent.propTypes = {
	importData: PropTypes.object,
	translate: PropTypes.func,
};

export default localize( SiteImporterImportableContent );
