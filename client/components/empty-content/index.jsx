/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { localizeUrl } from 'lib/i18n-utils';

/**
 * Style Dependencies
 */
import './style.scss';

class EmptyContent extends Component {
	static propTypes = {
		title: PropTypes.oneOfType( [ PropTypes.string, PropTypes.array ] ),
		illustration: PropTypes.string,
		illustrationWidth: PropTypes.number,
		line: PropTypes.oneOfType( [ PropTypes.string, PropTypes.array ] ),
		action: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element ] ),
		actionURL: PropTypes.string,
		actionCallback: PropTypes.func,
		actionTarget: PropTypes.string,
		actionHoverCallback: PropTypes.func,
		secondaryAction: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element ] ),
		secondaryActionURL: PropTypes.string,
		secondaryActionCallback: PropTypes.func,
		secondaryActionTarget: PropTypes.string,
		className: PropTypes.string,
		isCompact: PropTypes.bool,
	};

	static defaultProps = {
		title: "You haven't created any content yet.",
		illustration: '/calypso/images/illustrations/illustration-empty-results.svg',
		isCompact: false,
	};

	primaryAction() {
		if ( typeof this.props.action !== 'string' ) {
			return this.props.action;
		}

		if ( this.props.actionURL || this.props.actionCallback ) {
			return (
				<Button
					primary
					className="empty-content__action"
					onClick={ this.props.actionCallback }
					href={ localizeUrl( this.props.actionURL ) }
					target={ this.props.actionTarget }
					onMouseEnter={ this.props.actionHoverCallback }
					onTouchStart={ this.props.actionHoverCallback }
				>
					{ this.props.action }
				</Button>
			);
		}
	}

	secondaryAction() {
		if ( typeof this.props.secondaryAction !== 'string' ) {
			return this.props.secondaryAction;
		}

		if ( this.props.secondaryActionURL || this.props.secondaryActionCallback ) {
			return (
				<Button
					className="empty-content__action button"
					onClick={ this.props.secondaryActionCallback }
					href={ this.props.secondaryActionURL }
					target={ this.props.secondaryActionTarget }
				>
					{ this.props.secondaryAction }
				</Button>
			);
		}
	}

	render() {
		const action = this.props.action && this.primaryAction();
		const secondaryAction = this.props.secondaryAction && this.secondaryAction();
		const illustration = this.props.illustration && (
			<img
				src={ this.props.illustration }
				alt=""
				width={ this.props.illustrationWidth }
				className="empty-content__illustration"
			/>
		);

		return (
			<div
				className={ classNames( 'empty-content', this.props.className, {
					'is-compact': this.props.isCompact,
					'has-title-only': this.props.title && ! this.props.line,
				} ) }
			>
				{ illustration }
				{ this.props.title ? <h2 className="empty-content__title">{ this.props.title }</h2> : null }
				{ this.props.line ? <h3 className="empty-content__line">{ this.props.line }</h3> : null }
				{ action }
				{ secondaryAction }
				{ this.props.children }
			</div>
		);
	}
}

export default EmptyContent;
