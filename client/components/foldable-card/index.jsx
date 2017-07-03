/**
 * External Dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal Dependencies
 */
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import Gridicon from 'gridicons';

class FoldableCard extends Component {
	static propTypes = {
		actionButton: PropTypes.element,
		actionButtonExpanded: PropTypes.element,
		cardKey: PropTypes.string,
		compact: PropTypes.bool,
		disabled: PropTypes.bool,
		expandedSummary: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element ] ),
		expanded: PropTypes.bool,
		icon: PropTypes.string,
		onClick: PropTypes.func,
		onClose: PropTypes.func,
		onOpen: PropTypes.func,
		screenReaderText: PropTypes.oneOfType( [ PropTypes.string, PropTypes.bool ] ),
		summary: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element ] )
	};

	static defaultProps = {
		onOpen: noop,
		onClose: noop,
		cardKey: '',
		icon: 'chevron-down',
		expanded: false,
		screenReaderText: false,
	};

	state = {
		expanded: this.props.expanded
	};

	componentWillReceiveProps( nextProps ) {
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
	}

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
				<div className="foldable-card__action" onClick={ clickAction }>
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
					onClick={ clickAction }>
					<span className="screen-reader-text">{ screenReaderText }</span>
					<Gridicon icon={ this.props.icon } size={ iconSize } />
				</button>
			);
		}
	}

	renderContent() {
		return (
			<div className="foldable-card__content">
				{ this.props.children }
			</div>
		);
	}

	renderHeader() {
		var summary = this.props.summary ? <span className="foldable-card__summary">{ this.props.summary } </span> : null,
			expandedSummary = this.props.expandedSummary ? <span className="foldable-card__summary_expanded">{ this.props.expandedSummary } </span> : null,
			headerClickAction = this.props.clickableHeader ? this.getClickAction() : null,
			headerClasses = classNames( 'foldable-card__header', {
				'is-clickable': !! this.props.clickableHeader,
				'has-border': !! this.props.summary
			} );
		return (
			<div className={ headerClasses } onClick={ headerClickAction }>
				<span className="foldable-card__main">{ this.props.header } </span>
				<span className="foldable-card__secondary">
					{ summary }
					{ expandedSummary }
					{ this.renderActionButton() }
				</span>
			</div>
		);
	}

	render() {
		var Container = this.props.compact ? CompactCard : Card,
			itemSiteClasses = classNames(
				'foldable-card',
				this.props.className,
				{
					'is-disabled': !! this.props.disabled,
					'is-expanded': !! this.state.expanded,
					'has-expanded-summary': !! this.props.expandedSummary
				}
			);

		return (
			<Container className={ itemSiteClasses }>
				{ this.renderHeader() }
				{ this.state.expanded && this.renderContent() }
			</Container>
		);
	}
}

export default localize( FoldableCard );
