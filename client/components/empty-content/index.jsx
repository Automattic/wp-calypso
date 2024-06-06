import { Button } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import illustrationEmptyResults from 'calypso/assets/images/illustrations/illustration-empty-results.svg';
import './style.scss';

class EmptyContent extends Component {
	static propTypes = {
		title: PropTypes.node,
		illustration: PropTypes.string,
		illustrationWidth: PropTypes.number,
		illustrationHeight: PropTypes.number,
		line: PropTypes.node,
		action: PropTypes.node,
		actionURL: PropTypes.string,
		actionCallback: PropTypes.func,
		actionTarget: PropTypes.string,
		actionHoverCallback: PropTypes.func,
		actionDisabled: PropTypes.bool,
		actionRef: PropTypes.oneOfType( [
			PropTypes.func,
			PropTypes.shape( { current: PropTypes.any } ),
		] ),
		secondaryAction: PropTypes.node,
		secondaryActionURL: PropTypes.string,
		secondaryActionCallback: PropTypes.func,
		secondaryActionTarget: PropTypes.string,
		className: PropTypes.string,
		isCompact: PropTypes.bool,
	};

	static defaultProps = {
		illustration: illustrationEmptyResults,
		isCompact: false,
	};

	primaryAction() {
		if ( ! this.props.action ) {
			return null;
		}

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
					disabled={ this.props.actionDisabled }
					ref={ this.props.actionRef }
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
		const { line } = this.props;
		const action = this.props.action && this.primaryAction();
		const secondaryAction = this.props.secondaryAction && this.secondaryAction();
		const title =
			this.props.title !== undefined
				? this.props.title
				: this.props.translate( "You haven't created any content yet." );
		const illustration = this.props.illustration && (
			<img
				src={ this.props.illustration }
				alt=""
				width={ this.props.illustrationWidth }
				height={ this.props.illustrationHeight }
				className="empty-content__illustration"
			/>
		);

		return (
			<div
				className={ clsx( 'empty-content', this.props.className, {
					'is-compact': this.props.isCompact,
					'has-title-only': title && ! this.props.line,
				} ) }
			>
				{ illustration }
				{ typeof title === 'string' ? (
					<h2 className="empty-content__title">{ title }</h2>
				) : (
					title ?? null
				) }
				{ typeof line === 'string' ? (
					<h3 className="empty-content__line">{ this.props.line }</h3>
				) : (
					line ?? null
				) }
				{ action }
				{ secondaryAction }
				{ this.props.children }
			</div>
		);
	}
}

export default localize( EmptyContent );
