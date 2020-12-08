/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { localize, translate } from 'i18n-calypso';
import classNames from 'classnames';
import { omit, noop } from 'lodash';

/**
 * Internal dependencies
 */
import FormTextarea from 'calypso/components/forms/form-textarea';

/**
 * Style dependencies
 */
import './style.scss';

export class CountedTextarea extends React.Component {
	static propTypes = {
		value: PropTypes.string,
		placeholder: PropTypes.string,
		countPlaceholderLength: PropTypes.bool,
		onChange: PropTypes.func,
		acceptableLength: PropTypes.number,
		showRemainingCharacters: PropTypes.bool,
		translate: PropTypes.func,
	};

	static defaultProps = {
		value: '',
		placeholder: '',
		countPlaceholderLength: false,
		onChange: noop,
		showRemainingCharacters: false,
		translate,
	};

	renderCountPanel = () => {
		let length = this.props.value.length;
		if ( ! length && this.props.countPlaceholderLength ) {
			length = this.props.placeholder.length;
		}

		let panelText;
		if ( this.props.showRemainingCharacters && this.props.acceptableLength ) {
			panelText = this.props.translate( '%d character remaining', '%d characters remaining', {
				context: 'Input length',
				args: [ this.props.acceptableLength - length ],
				count: this.props.acceptableLength - length,
			} );
		} else {
			panelText = this.props.translate( '%d character', '%d characters', {
				context: 'Input length',
				args: [ length ],
				count: length,
			} );
		}

		return (
			<div className="counted-textarea__count-panel">
				{ panelText }
				{ this.props.children }
			</div>
		);
	};

	render() {
		const classes = classNames( 'counted-textarea', this.props.className, {
			'is-exceeding-acceptable-length':
				this.props.acceptableLength && this.props.value.length > this.props.acceptableLength,
		} );

		return (
			<div className={ classes }>
				<FormTextarea
					{ ...omit(
						this.props,
						'className',
						'acceptableLength',
						'showRemainingCharacters',
						'children',
						'countPlaceholderLength',
						'moment',
						'numberFormat',
						'translate'
					) }
					className="counted-textarea__input"
				/>
				{ this.renderCountPanel() }
			</div>
		);
	}
}

export default localize( CountedTextarea );
