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
import { resetImport } from 'lib/importer/actions';
import { recordTracksEvent } from 'state/analytics/actions';

export class DoneButton extends React.PureComponent {
	static displayName = 'DoneButton';

	static propTypes = {
		importerStatus: PropTypes.shape( {
			importerId: PropTypes.string.isRequired,
			type: PropTypes.string.isRequired,
		} ),
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
		} ),
	};

	handleClick = () => {
		const {
			importerStatus: { importerId, type },
			site: { ID: siteId },
		} = this.props;
		const tracksType = type.endsWith( 'site-importer' ) ? type + '-wix' : type;

		resetImport( siteId, importerId );

		this.props.recordTracksEvent( 'calypso_importer_main_done_clicked', {
			blog_id: siteId,
			importer_id: tracksType,
		} );
	};

	render() {
		const { translate } = this.props;

		return (
			<Button className="importer-header__action-button" isPrimary onClick={ this.handleClick }>
				{ translate( 'Done', { context: 'adjective' } ) }
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
)( DoneButton );
