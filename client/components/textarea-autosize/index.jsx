/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import autosize from 'autosize';

/**
 * Internal dependencies
 */
import FormTextarea from 'calypso/components/forms/form-textarea';

/**
 * Style dependencies
 */
import './style.scss';

export default class TextareaAutosize extends Component {
	static propTypes = {
		className: PropTypes.string,
	};

	textareaRef = React.createRef();

	componentDidMount() {
		autosize( this.textareaRef.current );
	}

	componentWillUnmount() {
		autosize.destroy( this.textareaRef.current );
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.value !== prevProps.value ) {
			this.resize();
		}
	}

	resize() {
		autosize.update( this.textareaRef.current );
	}

	render() {
		const classes = classnames( 'textarea-autosize', this.props.className );

		return (
			<FormTextarea { ...this.props } className={ classes } forwardedRef={ this.textareaRef } />
		);
	}
}
