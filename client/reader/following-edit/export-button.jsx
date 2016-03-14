/** @ssr-ready **/

/**
 * External dependencies
 */
import Blob from 'blob';
import React from 'react';
import noop from 'lodash/noop';
import { saveAs } from 'browser-filesaver';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import Button from 'components/button';

const FollowingExportButton = React.createClass( {
	propTypes: {
		onError: React.PropTypes.func
	},

	getDefaultProps() {
		return {
			onError: noop
		};
	},

	getInitialState() {
		return {
			disabled: false
		};
	},

	onClick() {
		wpcom.undocumented().exportReaderFeed( this.onFeed );
		this.setState( {
			disabled: true
		} );
	},

	onFeed( err, data ) {
		this.setState( {
			disabled: false
		} );

		if ( ! err && ! data.success ) {
			err = new Error( this.translate( 'Error exporting Reader feed' ) );
		}

		if ( err ) {
			this.props.onError( err );
		} else {
			const blob = new Blob( [ data.opml ], { type: 'text/xml;charset=utf-8' } );
			saveAs( blob, 'reader.xml' );
		}
	},

	render() {
		return (
			<Button
				compact
				disabled={ this.state.disabled }
				onClick={ this.onClick } >
				{ this.translate( 'Export' ) }
			</Button>
		);
	}
} );

export default FollowingExportButton;
