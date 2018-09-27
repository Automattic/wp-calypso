/** @format */

/**
 * Internal dependencies
 */

import SpinnerLine from 'components/spinner-line';

/**
 * External dependencies
 */

import handler from 'wpcom-xhr-request';
import React from 'react';
import PropTypes from 'prop-types';

export default class extends React.Component {
	static displayName = 'Shortcode';

	static propTypes = {
		slug: PropTypes.string,
	};

	state = {
		title: null,
		content: null,
		isLoading: true,
	};

	componentDidMount() {
		handler(
			'/sites/murieldesignsystem.blog/posts/slug:' + encodeURIComponent( this.props.slug ),
			( error, body ) => {
				if ( error ) {
					return this.setState( { isLoading: false } );
				}

				this.setState( {
					isLoading: false,
					title: body.title,
					content: body.content,
				} );
			}
		);
	}

	render() {
		const { title, content, isLoading } = this.state;

		if ( isLoading ) {
			return <SpinnerLine />;
		}

		return (
			<div>
				<h1>{ title }</h1>
				{ /*eslint-disable-next-line react/no-danger*/ }
				<div dangerouslySetInnerHTML={ { __html: content } } />
			</div>
		);
	}
}
