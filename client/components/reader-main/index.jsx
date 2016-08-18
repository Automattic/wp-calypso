/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import Main from 'components/main';

export default class ReaderMain extends React.Component {
	componentWillMount() {
		document.querySelector( 'body' ).classList.add( 'is-reader-page' );
	}

	componentWillUnmount() {
		document.querySelector( 'body' ).classList.remove( 'is-reader-page' );
	}

	render() {
		return ( <Main { ...this.props } /> );
	}
}
