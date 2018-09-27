/** @format */

/**
 * Internal dependencies
 */

import SpinnerLine from 'components/spinner-line';

/**
 * External dependencies
 */

import React from 'react';

export default class extends React.Component {
	static displayName = 'Shortcode';

	state = {
		content: null,
		isLoading: false,
	};

	componentDidMount() {
		fetch( this.props.url )
			.then( response => {
				if ( response.ok ) {
					return response.text();
				}

				throw new Error( 'Something went wrong ...' );
			} )
			.then( data => this.setState( { content: data, isLoading: false } ) )
			.catch( error => this.setState( { error, isLoading: false } ) );
	}

	render() {
		const { content, isLoading } = this.state;

		if ( ! isLoading ) {
			return <SpinnerLine />;
		}

		//eslint-disable-next-line react/no-danger
		return <div dangerouslySetInnerHTML={ { __html: content } } />;
	}
}
