import { Icon } from '@wordpress/components';
import { chevronDown } from '@wordpress/icons';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, createElement } from 'react';
import { Card, CompactCard, Gridicon, ScreenReaderText } from '../';

import './style.scss';

const noop = () => {};

class FoldableCard extends Component {
	static displayName = 'FoldableCard';

	static propTypes = {
		actionButton: PropTypes.node,
		actionButtonExpanded: PropTypes.node,
		cardKey: PropTypes.string,
		clickableHeader: PropTypes.bool,
		compact: PropTypes.bool,
		disabled: PropTypes.bool,
		expandable: PropTypes.bool,
		expandedSummary: PropTypes.node,
		expanded: PropTypes.bool,
		headerTagName: PropTypes.string,
		icon: PropTypes.string,
		iconSize: PropTypes.number,
		onClick: PropTypes.func,
		onClose: PropTypes.func,
		onOpen: PropTypes.func,
		screenReaderText: PropTypes.oneOfType( [ PropTypes.string, PropTypes.bool ] ),
		summary: PropTypes.node,
		hideSummary: PropTypes.bool,
		highlight: PropTypes.string,
		smooth: PropTypes.bool,
		contentExpandedStyle: PropTypes.object,
		contentCollapsedStyle: PropTypes.object,
	};

	static defaultProps = {
		onOpen: noop,
		onClose: noop,
		cardKey: '',
		headerTagName: 'span',
		iconSize: 24,
		expandable: true,
		expanded: false,
		screenReaderText: false,
		smooth: false,
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
		if ( this.props.disabled || ! this.props.expandable ) {
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
			const screenReaderText = this.props.screenReaderText || this.props.translate( 'More' );
			return (
				<button
					disabled={ this.props.disabled || ! this.props.expandable }
					type="button"
					className="foldable-card__action foldable-card__expand"
					aria-expanded={ this.state.expanded }
					onClick={ clickAction }
				>
					<ScreenReaderText>{ screenReaderText }</ScreenReaderText>
					{ this.props.icon ? (
						<Gridicon icon={ this.props.icon } size={ this.props.iconSize } />
					) : (
						<Icon icon={ chevronDown } size={ this.props.iconSize } className="gridicon" />
					) }
				</button>
			);
		}
	}

	renderContent() {
		const additionalStyle = this.state.expanded
			? this.props.contentExpandedStyle
			: this.props.contentCollapsedStyle;
		return (
			<div className="foldable-card__content" style={ additionalStyle }>
				{ this.props.children }
			</div>
		);
	}

	renderHeader() {
		const summary = this.props.summary ? (
			<span className="foldable-card__summary">{ this.props.summary } </span>
		) : null;
		const expandedSummary = this.props.expandedSummary ? (
			<span className="foldable-card__summary-expanded">{ this.props.expandedSummary } </span>
		) : null;
		const headerClickAction = this.props.clickableHeader ? this.getClickAction() : null;
		const headerClasses = clsx( 'foldable-card__header', {
			'is-clickable': !! this.props.clickableHeader,
			'is-expandable': this.props.expandable,
		} );
		const header = createElement(
			this.props.headerTagName,
			{ className: 'foldable-card__main' },
			this.props.header,
			this.renderActionButton()
		);

		return (
			<div className={ headerClasses } role="presentation" onClick={ headerClickAction }>
				{ header }
				{ ! this.props.hideSummary && (
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
		const itemSiteClasses = clsx( 'foldable-card', this.props.className, {
			'is-disabled': !! this.props.disabled,
			'is-expanded': !! this.state.expanded,
			'has-expanded-summary': !! this.props.expandedSummary,
			'is-smooth': !! this.props.smooth,
		} );

		return (
			<Container className={ itemSiteClasses } highlight={ this.props.highlight }>
				{ this.renderHeader() }
				{ ( this.state.expanded || this.props.smooth ) && this.renderContent() }
			</Container>
		);
	}
}

export default localize( FoldableCard );
