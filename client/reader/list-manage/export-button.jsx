/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { saveAs } from 'browser-filesaver';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import ReaderExportButton from 'blocks/reader-export-button/button';
import wpcom from 'lib/wp';
import { errorNotice } from 'state/notices/actions';

class ReaderListExportButton extends React.Component {
	static propTypes = {
		listId: PropTypes.number.isRequired,
		saveAs: PropTypes.string,
	};

	static defaultProps = {
		saveAs: 'reader-list-subscriptions.opml',
	};

	state = { disabled: false };

	onClick = () => {
		// Don't kick off a new export request if there's one in progress
		if ( this.state.disabled ) {
			return;
		}

		wpcom.undocumented().exportReaderList( this.props.listId, this.onApiResponse );
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
		saveAs( blob, this.props.saveAs );
	};

	render() {
		if ( ! this.props.listId ) {
			return null;
		}

		return <ReaderExportButton onClick={ this.onClick } />;
	}
}

export default connect( null, { errorNotice } )( localize( ReaderListExportButton ) );
