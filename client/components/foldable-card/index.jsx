/** @format */
/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal Dependencies
 */
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import Gridicon from 'gridicons';
import ScreenReaderText from 'components/screen-reader-text';

class FoldableCard extends Component {
	static displayName = 'FoldableCard';

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
		summary: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element ] ),
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
		expanded: this.props.expanded,
	};

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.expanded !== this.props.expanded ) {
			this.setState( { expanded: nextProps.expanded } );
		}
	}

	clickAction = () => ! this.props.clickableHeader && ! this.props.disabled && this.onClick();

	clickExpander = () => ! this.props.clickableHeader && ! this.props.disabled && this.onClick();

	clickHeader = () => this.props.clickableHeader && ! this.props.disabled && this.onClick();

	onActionKeyPress = event => {
		// enter press
		if ( 13 === event.keyCode ) {
			this.clickAction();
		}
	};

	onHeaderKeyPress = event => {
		// enter press
		if ( 13 === event.keyCode ) {
			this.clickHeader();
		}
	};

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

	render() {
		const {
			actionButton,
			actionButtonExpanded,
			className,
			clickableHeader,
			compact,
			disabled,
			expandedSummary,
			header,
			icon,
			screenReaderText,
			summary,
			translate,
		} = this.props;

		const Container = compact ? CompactCard : Card;

		const itemSiteClasses = classNames( 'foldable-card', className, {
			'is-disabled': !! disabled,
			'is-expanded': !! this.state.expanded,
			'has-expanded-summary': !! expandedSummary,
		} );

		const headerClasses = classNames( 'foldable-card__header', {
			'is-clickable': !! clickableHeader,
			'has-border': !! summary,
		} );

		return (
			<Container className={ itemSiteClasses }>
				<div
					className={ headerClasses }
					onKeyPress={ this.onHeaderKeyPress }
					onClick={ this.clickHeader }
					role="button"
					tabIndex={ 0 }
				>
					<span className="foldable-card__main">{ header } </span>
					<span className="foldable-card__secondary">
						{ summary && <span className="foldable-card__summary">{ summary } </span> }
						{ expandedSummary && (
							<span className="foldable-card__summary-expanded">{ expandedSummary } </span>
						) }
						{ actionButton ? (
							<div
								className="foldable-card__action"
								onKeyPress={ this.onActionKeyPress }
								onClick={ this.clickAction }
								role="button"
							>
								{ ( this.state.expanded && actionButtonExpanded ) || actionButton }
							</div>
						) : (
							this.props.children && (
								<button
									disabled={ disabled }
									type="button"
									className="foldable-card__action foldable-card__expand"
									onClick={ this.clickExpander }
								>
									<ScreenReaderText>{ screenReaderText || translate( 'More' ) }</ScreenReaderText>
									<Gridicon icon={ icon } size={ 24 } />
								</button>
							)
						) }
					</span>
				</div>
				{ this.state.expanded && (
					<div className="foldable-card__content">{ this.props.children }</div>
				) }
			</Container>
		);
	}
}

export default localize( FoldableCard );
