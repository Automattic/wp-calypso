/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React, { Component } from 'react';
import classNames from 'classnames';

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

	static displayName = 'EmptyContent';

	primaryAction() {
		if ( 'string' !== typeof this.props.action ) {
			return this.props.action;
		}

		if ( this.props.actionURL && this.props.actionCallback ) {
			return (
				<a
					className="empty-content__action button is-primary"
					onClick={ this.props.actionCallback }
					href={ this.props.actionURL }
				>
					{ this.props.action }
				</a>
			);
		} else if ( this.props.actionURL ) {
			let targetProp = {};
			if ( this.props.actionTarget ) {
				targetProp = { target: this.props.actionTarget, rel: 'noopener noreferrer' };
			}

			return (
				<a
					className="empty-content__action button is-primary"
					href={ this.props.actionURL }
					{ ...targetProp }
				>
					{ this.props.action }
				</a>
			);
		} else if ( this.props.actionCallback ) {
			return (
				<a
					className="empty-content__action button is-primary"
					onClick={ this.props.actionCallback }
				>
					{ this.props.action }
				</a>
			);
		}
	}

	secondaryAction() {
		if ( 'string' !== typeof this.props.secondaryAction ) {
			return this.props.secondaryAction;
		}

		if ( this.props.secondaryActionURL && this.props.secondaryActionCallback ) {
			return (
				<a
					className="empty-content__action button"
					onClick={ this.props.secondaryActionCallback }
					href={ this.props.secondaryActionURL }
				>
					{ this.props.secondaryAction }
				</a>
			);
		} else if ( this.props.secondaryActionURL ) {
			let targetProp = {};
			if ( this.props.secondaryActionTarget ) {
				targetProp = { target: this.props.secondaryActionTarget, rel: 'noopener noreferrer' };
			}

			return (
				<a
					className="empty-content__action button"
					href={ this.props.secondaryActionURL }
					{ ...targetProp }
				>
					{ this.props.secondaryAction }
				</a>
			);
		} else if ( this.props.secondaryActionCallback ) {
			return (
				<a className="empty-content__action button" onClick={ this.props.secondaryActionCallback }>
					{ this.props.secondaryAction }
				</a>
			);
		}
	}

	render() {
		const action = this.props.action && this.primaryAction();
		const secondaryAction = this.props.secondaryAction && this.secondaryAction();
		const illustration =
			this.props.illustration &&
			<img
				src={ this.props.illustration }
				width={ this.props.illustrationWidth }
				className="empty-content__illustration"
			/>;

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
			</div>
		);
	}
}

export default EmptyContent;
