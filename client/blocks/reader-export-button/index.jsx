/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { saveAs } from 'browser-filesaver';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { errorNotice } from 'state/notices/actions';
import Gridicon from 'components/gridicon';
import {
	READER_EXPORT_TYPE_SUBSCRIPTIONS,
	READER_EXPORT_TYPE_LIST,
} from 'blocks/reader-export-button/constants';

/**
 * Style dependencies
 */
import './style.scss';

class ReaderExportButton extends React.Component {
	static propTypes = {
		exportType: PropTypes.oneOf( [ READER_EXPORT_TYPE_SUBSCRIPTIONS, READER_EXPORT_TYPE_LIST ] ),
		filename: PropTypes.string,
		listId: PropTypes.number, // only when exporting a list
	};

	static defaultProps = {
		filename: 'reader-export.opml',
		exportType: READER_EXPORT_TYPE_SUBSCRIPTIONS,
	};

	state = { disabled: false };

	onClick = () => {
		// Don't kick off a new export request if there's one in progress
		if ( this.state.disabled ) {
			return;
		}

		if ( this.props.exportType === READER_EXPORT_TYPE_LIST ) {
			wpcom.undocumented().exportReaderList( this.props.listId, this.onApiResponse );
		} else {
			wpcom.undocumented().exportReaderSubscriptions( this.onApiResponse );
		}

		this.setState( {
			disabled: true,
		} );
	};

	onApiResponse = ( err, data ) => {
		this.setState( {
			disabled: false,
		} );

		if ( ! err && ! data.success ) {
			this.props.errorNotice(
				this.props.translate( 'Sorry, there was a problem creating your export file.' )
			);
			return;
		}

		const blob = new Blob( [ data.opml ], { type: 'text/xml;charset=utf-8' } ); // eslint-disable-line no-undef
		saveAs( blob, this.props.filename );
	};

	render() {
		return (
			<button className="reader-export-button" onClick={ this.onClick }>
				<Gridicon icon="cloud-download" className="reader-export-button__icon" />
				<span className="reader-export-button__label">{ this.props.translate( 'Export' ) }</span>
			</button>
		);
	}
}

export default connect( null, { errorNotice } )( localize( ReaderExportButton ) );
