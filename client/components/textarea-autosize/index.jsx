/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import autosize from 'autosize';

export default class TextareaAutosize extends Component {
	static propTypes = {
		className: PropTypes.string,
	};

	componentDidMount() {
		autosize( this.refs.textarea );
	}

	componentWillUnmount() {
		autosize.destroy( this.refs.textarea );
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.value !== prevProps.value ) {
			this.resize();
		}
	}

	resize() {
		autosize.update( this.refs.textarea );
	}

	render() {
		const classes = classnames( 'textarea-autosize', this.props.className );

		return <textarea ref="textarea" { ...this.props } className={ classes } />;
	}
}
