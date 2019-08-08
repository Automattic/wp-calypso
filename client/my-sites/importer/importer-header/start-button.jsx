/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { flow } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Button from 'components/forms/form-button';
import { startImport } from 'lib/importer/actions';
import { recordTracksEvent } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './start-button.scss';

class StartButton extends React.PureComponent {
	static displayName = 'StartButton';

	static propTypes = {
		importerStatus: PropTypes.shape( {
			engine: PropTypes.string.isRequired,
		} ),
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
		} ),
	};

	handleClick = () => {
		const {
			importerStatus: { engine },
			site: { ID: siteId },
		} = this.props;

		startImport( siteId, engine );

		this.props.recordTracksEvent( 'calypso_importer_main_start_clicked', {
			blog_id: siteId,
			engine,
		} );
	};

	render() {
		const { translate } = this.props;

		return (
			<Button
				className="importer-header__action-button"
				isPrimary={ false }
				onClick={ this.handleClick }
			>
				{ translate( 'Start Import', { context: 'verb' } ) }
			</Button>
		);
	}
}

export default flow(
	connect(
		null,
		{ recordTracksEvent }
	),
	localize
)( StartButton );
