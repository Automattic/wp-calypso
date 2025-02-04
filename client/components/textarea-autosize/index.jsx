import autosize from 'autosize';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { createRef, Component } from 'react';
import FormTextarea from 'calypso/components/forms/form-textarea';

import './style.scss';

export default class TextareaAutosize extends Component {
	static propTypes = {
		className: PropTypes.string,
	};

	textareaRef = createRef();

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
		const classes = clsx( 'textarea-autosize', this.props.className );

		return (
			<FormTextarea { ...this.props } className={ classes } forwardedRef={ this.textareaRef } />
		);
	}
}
