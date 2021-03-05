/**
 * External dependencies
 */
import React, { Component } from 'react';
import classnames from 'classnames';

/**
 * Style dependencies
 */
import './style.scss';

export default class Image extends Component {
	static defaultProps = {
		className: '',
	};
	// by default, we give the image a shot at loading
	state = {
		isError: false,
	};

	UNSAFE_componentWillReceiveProps( nextProps ) {
		// reset the error state if we switch images
		// TODO: support srcsets?
		if ( nextProps.src !== this.props.src ) {
			this.setState( { isError: false } );
		}
	}

	handleError = () => {
		this.setState( { isError: true } );
	};

	render() {
		const { className, ...others } = this.props;
		const allClasses = classnames( className, {
			image: true,
			'is-error': this.state.isError,
		} );
		// eslint-disable-next-line jsx-a11y/alt-text
		return <img onError={ this.handleError } className={ allClasses } { ...others } />;
	}
}
