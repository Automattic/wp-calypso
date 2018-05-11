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
			expanded,
			expandedSummary,
			header,
			icon,
			screenReaderText,
			summary,
			translate,
		} = this.props;

		const Container = compact ? CompactCard : Card;

		const clickAction = ! disabled ? this.onClick : null;
		const itemSiteClasses = classNames( 'foldable-card', className, {
			'is-disabled': !! disabled,
			'is-expanded': !! expanded,
			'has-expanded-summary': !! expandedSummary,
		} );

		const headerClickAction = clickableHeader ? clickAction : null;
		const headerClasses = classNames( 'foldable-card__header', {
			'is-clickable': !! clickableHeader,
			'has-border': !! summary,
		} );

		return (
			<Container className={ itemSiteClasses }>
				<div className={ headerClasses } onClick={ headerClickAction }>
					<span className="foldable-card__main">{ header } </span>
					<span className="foldable-card__secondary">
						{ summary && <span className="foldable-card__summary">{ summary } </span> }
						{ expandedSummary && (
							<span className="foldable-card__summary-expanded">{ expandedSummary } </span>
						) }
						{ actionButton ? (
							<div
								className="foldable-card__action"
								onClick={ ! clickableHeader ? clickAction : null }
							>
								{ ( expanded && actionButtonExpanded ) || actionButton }
							</div>
						) : (
							this.props.children && (
								<button
									disabled={ disabled }
									type="button"
									className="foldable-card__action foldable-card__expand"
									onClick={ ! clickableHeader ? clickAction : null }
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
