/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal Dependencies
 */
import Main from 'components/main';
import SyncReaderFollows from 'components/data/sync-reader-follows';

/*
 * We ref-count number of ReaderMains on screen in order to avoid a race condition
 *
 * If two pages in a row have a ReaderMain there is no guarantee as to the order of dismounting
 * and mounting. If we naively toggled the readerPage within willMount and willDismount
 * we could run into a weird state.
 *
 * A problem sequence would be:
 * 1. land on reader (mount, 1 ref)
 * 2. navigate to another reader page (mount new ReaderMain, 2 ref)
 * 3. dismount old ReaderMain from the first step (dismount, 1 ref)
 */
let activeReaderMainRefCount = 0;
const setIsReaderPage = add => {
	if ( add ) {
		document.querySelector( 'body' ).classList.add( 'is-reader-page' );
	} else if ( activeReaderMainRefCount === 0 ) {
		document.querySelector( 'body' ).classList.remove( 'is-reader-page' );
	}
};

/**
 * A specialization of `Main` that adds a class to the body of the document
 *
 * This class is used by pieces of the Reader Refresh (circa Sept 2016) to indicate they want "editorial" styles.
 * Notably, this overrides the background color of the document and is used as a hook by other parts to override styles.
 */
export default class ReaderMain extends React.Component {
	componentWillMount() {
		activeReaderMainRefCount++;
		setIsReaderPage( true );
	}

	componentWillUnmount() {
		activeReaderMainRefCount--;
		setIsReaderPage( false );
	}

	render() {
		const { children, ...props } = this.props;
		return (
			<Main { ...props }>
				<SyncReaderFollows key="syncReaderFollows" />
				{ children }
			</Main>
		);
	}
}
