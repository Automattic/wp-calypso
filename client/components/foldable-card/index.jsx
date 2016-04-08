/**
 * External Dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' ),
	noop = require( 'lodash/noop' );

/**
 * Internal Dependencies
 */
var Card = require( 'components/card' ),
	CompactCard = require( 'components/card/compact' ),
	Gridicon = require( 'components/gridicon' );

var FoldableCard = React.createClass( {

	propTypes: {
		actionButton: React.PropTypes.element,
		actionButtonExpanded: React.PropTypes.element,
		cardKey: React.PropTypes.string,
		compact: React.PropTypes.bool,
		disabled: React.PropTypes.bool,
		expandedSummary: React.PropTypes.oneOfType( [ React.PropTypes.string, React.PropTypes.element ] ),
		expanded: React.PropTypes.bool,
		icon: React.PropTypes.string,
		onClick: React.PropTypes.func,
		onClose: React.PropTypes.func,
		onOpen: React.PropTypes.func,
		screenReaderText: React.PropTypes.string,
		summary: React.PropTypes.oneOfType( [ React.PropTypes.string, React.PropTypes.element ] )
	},

	getInitialState: function() {
		return {
			expanded: this.props.expanded
		};
	},

	getDefaultProps: function() {
		return {
			onOpen: noop,
			onClose: noop,
			cardKey: '',
			icon: 'chevron-down',
			isExpanded: false,
			screenReaderText: '',
		};
	},

	onClick: function() {
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
	},

	getClickAction: function() {
		if ( this.props.disabled ) {
			return;
		}
		return this.onClick;
	},

	getActionButton: function() {
		if ( this.state.expanded ) {
			return this.props.actionButtonExpanded || this.props.actionButton;
		}
		return this.props.actionButton;
	},

	renderActionButton: function() {
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
			return (
				<button disabled={ this.props.disabled } className="foldable-card__action foldable-card__expand" onClick={ clickAction }>
					<span className="screen-reader-text">{ this.props.screenReaderText }</span>
					<Gridicon icon={ this.props.icon } size={ iconSize } />
				</button>
			);
		}
	},

	renderContent: function() {
		return (
			<div className="foldable-card__content">
				{ this.props.children }
			</div>
		);
	},

	renderHeader: function() {
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
	},

	render: function() {
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
} );

module.exports = FoldableCard;
