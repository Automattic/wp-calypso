import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { includes } from 'lodash';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import ImporterLogo from 'calypso/my-sites/importer/importer-logo';
import { appStates } from 'calypso/state/imports/constants';
import { isUploading } from 'calypso/state/imports/uploads/selectors';

import './style.scss';

/**
 * Module variables
 */
const startStates = [ appStates.DISABLED, appStates.INACTIVE ];

class ImporterHeader extends PureComponent {
	static displayName = 'ImporterHeader';

	static propTypes = {
		importerStatus: PropTypes.shape( {
			importerState: PropTypes.string.isRequired,
			type: PropTypes.string.isRequired,
		} ),
		description: PropTypes.node.isRequired,
		icon: PropTypes.string.isRequired,
		title: PropTypes.string.isRequired,
	};

	render() {
		const { importerStatus, icon, title, description } = this.props;
		const { importerState } = importerStatus;
		const showStart = includes( startStates, importerState );
		const headerClasses = clsx( 'importer-header', {
			'importer-header__is-start': showStart,
		} );

		return (
			<header className={ headerClasses }>
				<ImporterLogo icon={ icon } />
				<div className="importer-header__service-info">
					<h1 className="importer-header__service-title">{ title }</h1>
					{ ! showStart && description }
				</div>
			</header>
		);
	}
}

export default connect( ( state ) => ( {
	isUploading: isUploading( state ),
} ) )( localize( ImporterHeader ) );
