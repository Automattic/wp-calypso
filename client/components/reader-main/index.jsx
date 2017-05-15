/**
 * External Dependencies
 */
import React from 'react';
import config from 'config';

/**
 * Internal Dependencies
 */
import Main from 'components/main';
import SyncReaderFollows from 'components/data/sync-reader-follows';

/**
 * A specialization of `Main` that adds a class to the body of the document
 *
 * This class is used by pieces of the Reader Refresh (circa Sept 2016) to indicate they want "editorial" styles.
 * Notably, this overrides the background color of the document and is used as a hook by other parts to override styles.
 */
export default class ReaderMain extends React.Component {
	componentWillMount() {
		document.querySelector( 'body' ).classList.add( 'is-reader-page' );
	}

	componentWillUnmount() {
		document.querySelector( 'body' ).classList.remove( 'is-reader-page' );
	}

	render() {
		const { children, ...props } = this.props;
		return ( <Main { ...props } >
			{ config.isEnabled( 'reader/following-manage-refresh' ) &&
				<SyncReaderFollows key="syncReaderFollows" /> }
			{ children }
		</Main> );
	}
}
