/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import omit from 'lodash/object/omit';
import noop from 'lodash/utility/noop';

/**
 * Internal dependencies
 */
import FormTextarea from 'components/forms/form-textarea';

export default React.createClass( {
	displayName: 'CountedTextarea',

	propTypes: {
		value: React.PropTypes.string,
		placeholder: React.PropTypes.string,
		countPlaceholderLength: React.PropTypes.bool,
		onChange: React.PropTypes.func,
		acceptableLength: React.PropTypes.number,
		showRemainingCharacters: React.PropTypes.bool
	},

	getDefaultProps() {
		return {
			value: '',
			placeholder: '',
			countPlaceholderLength: false,
			onChange: noop,
			showRemainingCharacters: false,
		};
	},

	renderCountPanel() {
		const length = this.props.value.length;

		if ( ! length && this.props.countPlaceholderLength ) {
			length = this.props.placeholder.length;
		}

		if ( this.props.showRemainingCharacters && this.props.acceptableLength ) {
			return ( <div className="counted-textarea__count-panel">
				{ this.translate( '%d character remaining', '%d characters remaining', {
					context: 'Input length',
					args: [ this.props.acceptableLength - length ],
					count: this.props.acceptableLength - length
				} ) }
					{ this.props.children }
				</div>
			);
		} else {
			return (
				<div className="counted-textarea__count-panel">
					{ this.translate( '%d character', '%d characters', {
						context: 'Input length',
						args: [ length ],
						count: length
					} ) }
					{ this.props.children }
				</div>
			);
		}
	},

	render() {
		const classes = classNames( 'counted-textarea', this.props.className, {
			'is-exceeding-acceptable-length': this.props.acceptableLength && this.props.value.length > this.props.acceptableLength
		} );

		return (
			<div className={ classes }>
				<FormTextarea
					{ ...omit( this.props, 'className', 'acceptableLength', 'showRemainingCharacters', 'children' ) }
					className="counted-textarea__input" />
				{ this.renderCountPanel() }
			</div>
		);
	}
} );
