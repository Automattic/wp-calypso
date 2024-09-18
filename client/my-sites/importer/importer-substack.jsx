import config from '@automattic/calypso-config';
import { CompactCard } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import importerConfig from 'calypso/lib/importer/importer-config';
import { appStates } from 'calypso/state/imports/constants';
import FileImporter from './file-importer';
import ImporterHeader from './importer-header';

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
		hideActionButtons: PropTypes.bool,
	};

	render() {
		const importerData = importerConfig( {
			importerState: this.props.importerStatus.importerState,
			siteSlug: this.props.siteSlug,
			siteTitle: this.props.siteTitle,
		} ).substack;

		if ( config.isEnabled( 'importers/newsletter' ) ) {
			const isEnabled = appStates.DISABLED !== this.props.importerStatus.importerState;
			const classNames = clsx( 'importer__site-importer-card', {
				'is-disabled': ! isEnabled,
			} );

			return (
				<CompactCard
					className={ classNames }
					href={ `/import/newsletter/substack/${ this.props.siteSlug }` }
				>
					<ImporterHeader
						importerStatus={ this.props.importerStatus }
						icon={ importerData.icon }
						title={ importerData.title }
						description={ importerData.description }
					/>
				</CompactCard>
			);
		}

		if ( this.props.hideUploadDescription ) {
			delete importerData.uploadDescription;
		}

		return <FileImporter importerData={ importerData } { ...this.props } />;
	}
}

export default localize( ImporterSubstack );
