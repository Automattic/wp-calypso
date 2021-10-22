import { Button, Gridicon } from '@automattic/components';
import { saveAs } from 'browser-filesaver';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import {
	READER_EXPORT_TYPE_SUBSCRIPTIONS,
	READER_EXPORT_TYPE_LIST,
} from 'calypso/blocks/reader-export-button/constants';
import wp from 'calypso/lib/wp';
import { errorNotice } from 'calypso/state/notices/actions';

import './style.scss';

class ReaderExportButton extends Component {
	static propTypes = {
		borderless: PropTypes.bool,
		disabled: PropTypes.bool,
		exportType: PropTypes.oneOf( [ READER_EXPORT_TYPE_SUBSCRIPTIONS, READER_EXPORT_TYPE_LIST ] ),
		filename: PropTypes.string,
		listId: PropTypes.number, // only when exporting a list
	};

	static defaultProps = {
		borderless: false,
		filename: 'reader-export.opml',
		exportType: READER_EXPORT_TYPE_SUBSCRIPTIONS,
		disabled: false,
	};

	state = { disabled: false };

	isMounted = false;

	componentDidMount() {
		this.isMounted = true;
	}

	componentWillUnmount() {
		this.isMounted = false;
	}

	onClick = async () => {
		// Don't kick off a new export request if there's one in progress
		if ( ! this.isMounted || this.props.disabled || this.state.disabled ) {
			return;
		}

		this.setState( {
			disabled: true,
		} );

		let data;

		try {
			if ( this.props.exportType === READER_EXPORT_TYPE_LIST ) {
				data = await wp.req.get( `/read/lists/${ this.props.listId }/export`, {
					apiNamespace: 'wpcom/v2',
				} );
			} else {
				data = await wp.req.get( `/read/following/mine/export`, { apiVersion: '1.2' } );
			}
		} catch ( error ) {
			this.showErrorNotice();
			return;
		}

		this.onApiResponse( data );
	};

	onApiResponse = ( data ) => {
		if ( ! data?.success ) {
			this.showErrorNotice();
			return;
		}

		const blob = new Blob( [ data.opml ], { type: 'text/xml;charset=utf-8' } );
		saveAs( blob, this.props.filename );

		if ( this.isMounted ) {
			this.setState( {
				disabled: false,
			} );
		}
	};

	showErrorNotice = () => {
		this.props.errorNotice(
			this.props.translate( 'Sorry, there was a problem creating your export file.' )
		);
	};

	render() {
		return (
			<Button
				borderless={ this.props.borderless }
				className={ classnames( {
					'reader-export-button': true,
					'is-disabled': this.props.disabled || this.state.disabled,
				} ) }
				disabled={ this.props.disabled || this.state.disabled }
				onClick={ this.onClick }
				primary={ ! this.props.borderless }
			>
				<Gridicon icon="cloud-download" className="reader-export-button__icon" />
				<span className="reader-export-button__label">{ this.props.translate( 'Export' ) }</span>
			</Button>
		);
	}
}

export default connect( null, { errorNotice } )( localize( ReaderExportButton ) );
