import { Card, CompactCard, ScreenReaderText, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, createElement } from 'react';

import './style.scss';

const noop = () => {};

class FoldableCard extends Component {
	static displayName = 'FoldableCard';

	static propTypes = {
		actionButton: PropTypes.node,
		actionButtonExpanded: PropTypes.node,
		cardKey: PropTypes.string,
		compact: PropTypes.bool,
		disabled: PropTypes.bool,
		expandedSummary: PropTypes.node,
		expanded: PropTypes.bool,
		headerTagName: PropTypes.string,
		icon: PropTypes.string,
		onClick: PropTypes.func,
		onClose: PropTypes.func,
		onOpen: PropTypes.func,
		screenReaderText: PropTypes.oneOfType( [ PropTypes.string, PropTypes.bool ] ),
		summary: PropTypes.node,
		highlight: PropTypes.string,
	};

	static defaultProps = {
		onOpen: noop,
		onClose: noop,
		cardKey: '',
		headerTagName: 'span',
		icon: 'chevron-down',
		expanded: false,
		screenReaderText: false,
	};

	state = {
		expanded: this.props.expanded,
	};

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( nextProps.expanded !== this.props.expanded ) {
			this.setState( { expanded: nextProps.expanded } );
		}
	}

	onClick = () => {
		if ( this.props.children ) {
			this.setState( { expanded: ! this.state.expanded } );
		}

		if ( this.props.onClick ) {
			this.props.onClick();
		}

		if ( this.state.expanded ) {
			this.props.onClose( this.props.cardKey );
		} else {
			this.props.onOpen( this.props.cardKey );
		}
	};

	getClickAction() {
		if ( this.props.disabled ) {
			return;
		}
		return this.onClick;
	}

	getActionButton() {
		if ( this.state.expanded ) {
			return this.props.actionButtonExpanded || this.props.actionButton;
		}
		return this.props.actionButton;
	}

	renderActionButton() {
		const clickAction = ! this.props.clickableHeader ? this.getClickAction() : null;
		if ( this.props.actionButton ) {
			return (
				<div className="foldable-card__action" role="presentation" onClick={ clickAction }>
					{ this.getActionButton() }
				</div>
			);
		}
		if ( this.props.children ) {
			const iconSize = 24;
			const screenReaderText = this.props.screenReaderText || this.props.translate( 'More' );
			return (
				<button
					disabled={ this.props.disabled }
					type="button"
					className="foldable-card__action foldable-card__expand"
					aria-expanded={ this.state.expanded }
					onClick={ clickAction }
				>
					<ScreenReaderText>{ screenReaderText }</ScreenReaderText>
					<Gridicon icon={ this.props.icon } size={ iconSize } />
				</button>
			);
		}
	}

	renderContent() {
		return <div className="foldable-card__content">{ this.props.children }</div>;
	}

	renderHeader() {
		const summary = this.props.summary ? (
			<span className="foldable-card__summary">{ this.props.summary } </span>
		) : null;
		const expandedSummary = this.props.expandedSummary ? (
			<span className="foldable-card__summary-expanded">{ this.props.expandedSummary } </span>
		) : null;
		const headerClickAction = this.props.clickableHeader ? this.getClickAction() : null;
		const headerClasses = classNames( 'foldable-card__header', {
			'is-clickable': !! this.props.clickableHeader,
			'has-border': !! this.props.summary,
		} );
		const header = createElement(
			this.props.headerTagName,
			{ className: 'foldable-card__main' },
			this.props.header,
			this.renderActionButton()
		);
		const hasSummary = this.props.expandedSummary || this.props.summary;

		return (
			<div className={ headerClasses } role="presentation" onClick={ headerClickAction }>
				{ header }
				{ hasSummary && (
					<span className="foldable-card__secondary">
						{ summary }
						{ expandedSummary }
					</span>
				) }
			</div>
		);
	}

	render() {
		const Container = this.props.compact ? CompactCard : Card;
		const itemSiteClasses = classNames( 'foldable-card', this.props.className, {
			'is-disabled': !! this.props.disabled,
			'is-expanded': !! this.state.expanded,
			'has-expanded-summary': !! this.props.expandedSummary,
		} );

		return (
			<Container className={ itemSiteClasses } highlight={ this.props.highlight }>
				{ this.renderHeader() }
				{ this.state.expanded && this.renderContent() }
			</Container>
		);
	}
}

export default localize( FoldableCard );
