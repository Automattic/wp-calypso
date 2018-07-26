/** @format */

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
import FormTextarea from 'components/forms/form-textarea';
import InfoPopover from 'components/info-popover';

export class CountedTextarea extends React.Component {
	static propTypes = {
		value: PropTypes.string,
		placeholder: PropTypes.string,
		countPlaceholderLength: PropTypes.bool,
		onChange: PropTypes.func,
		acceptableLength: PropTypes.number,
		showRemainingCharacters: PropTypes.bool,
		translate: PropTypes.func,
		helpText: PropTypes.string,
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
			if ( this.props.maxLength ) {
				panelText = this.props.translate( '%d character remaining', '%d characters remaining', {
					context: 'Input length',
					args: [ this.props.maxLength - length ],
					count: this.props.maxLength - length,
				} );
			} else {
				panelText = this.props.translate( '%d character remaining', '%d characters remaining', {
					context: 'Input length',
					args: [ this.props.acceptableLength - length ],
					count: this.props.acceptableLength - length,
				} );
			}
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
				{ this.props.helpText ? this.renderInfoPopover() : null }
			</div>
		);
	};

	renderInfoPopover = () => {
		return <InfoPopover position="top left">{ this.props.helpText }</InfoPopover>;
	};

	getClassNames = () => {
		if ( this.props.maxLength && this.props.value.length >= this.props.maxLength ) {
			return 'is-exceeding-max-length is-exceeding-length';
		}

		if ( this.props.acceptableLength && this.props.value.length > this.props.acceptableLength ) {
			return 'is-exceeding-acceptable-length is-exceeding-length';
		}
	};

	render() {
		const classes = classNames( 'counted-textarea', this.props.className, this.getClassNames() );

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
