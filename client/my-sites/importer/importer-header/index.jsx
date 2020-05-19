/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { get, includes } from 'lodash';
import { connect } from 'react-redux';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { appStates } from 'state/imports/constants';
import ImporterLogo from 'my-sites/importer/importer-logo';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Module variables
 */
const startStates = [ appStates.DISABLED, appStates.INACTIVE ];

class ImporterHeader extends React.PureComponent {
	static displayName = 'ImporterHeader';

	static propTypes = {
		importerStatus: PropTypes.shape( {
			importerState: PropTypes.string.isRequired,
			type: PropTypes.string.isRequired,
		} ),
		description: PropTypes.oneOfType( [ PropTypes.string, PropTypes.node ] ).isRequired,
		icon: PropTypes.string.isRequired,
		title: PropTypes.string.isRequired,
	};

	render() {
		const { importerStatus, icon, title, description } = this.props;
		const { importerState } = importerStatus;
		const showStart = includes( startStates, importerState );
		const headerClasses = classnames( 'importer-header', {
			'importer-header__is-start': showStart,
		} );

		return (
			<header className={ headerClasses }>
				<ImporterLogo icon={ icon } />
				<div className="importer-header__service-info">
					<h1 className="importer-header__service-title">{ title }</h1>
					{ ! showStart && <p>{ description }</p> }
				</div>
			</header>
		);
	}
}

export default connect( ( state ) => ( {
	isUploading: get( state, 'imports.uploads.inProgress' ),
} ) )( localize( ImporterHeader ) );
