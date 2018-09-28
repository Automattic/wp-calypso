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

const FETCH_URL_BASE = '/sites/murieldesignsystem.blog/posts/';

export default class extends React.Component {
	static displayName = 'Shortcode';

	static propTypes = {
		slug: PropTypes.string,
		id: PropTypes.number,
		onFetch: PropTypes.func,
	};

	state = {
		title: null,
		content: null,
		isLoading: true,
	};

	componentDidMount() {
		this.fetch();
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.slug !== prevProps.slug ) {
			this.fetch();
		}
	}

	fetch() {
		handler( FETCH_URL_BASE + this.getFetchUrl(), ( error, body ) => {
			if ( error ) {
				return this.setState( { isLoading: false } );
			}

			this.setState( {
				isLoading: false,
				title: body.title,
				content: body.content,
			} );

			if ( this.props.onFetch ) {
				this.props.onFetch.call();
			}
		} );
	}

	getFetchUrl() {
		if ( this.props.slug ) {
			return 'slug:' + encodeURIComponent( this.props.slug );
		}

		return this.props.id;
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
