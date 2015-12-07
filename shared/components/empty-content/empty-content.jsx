/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:components:emptyContent' ),
	classNames = require( 'classnames' );

module.exports = React.createClass( {

	displayName: 'EmptyContent',

	propTypes: {
		title: React.PropTypes.string,
		illustration: React.PropTypes.string,
		illustrationWidth: React.PropTypes.number,
		line: React.PropTypes.string,
		action: React.PropTypes.oneOfType( [
			React.PropTypes.string,
			React.PropTypes.element
		] ),
		actionURL: React.PropTypes.string,
		actionCallback: React.PropTypes.func,
		secondaryAction: React.PropTypes.oneOfType( [
			React.PropTypes.string,
			React.PropTypes.element
		] ),
		secondaryActionURL: React.PropTypes.string,
		secondaryActionCallback: React.PropTypes.func,
		className: React.PropTypes.string,
		isCompact: React.PropTypes.bool
	},

	componentDidMount: function() {
		debug( 'Empty Content React component mounted.' );
	},

	getDefaultProps: function() {
		return {
			title: "You haven't created any content yet.",
			illustration: '/calypso/images/drake/drake-empty-results.svg',
			isCompact: false
		};
	},

	primaryAction: function() {
		if ( 'string' !== typeof this.props.action ) {
			return this.props.action;
		}

		if ( this.props.actionURL && this.props.actionCallback ) {
			return <a className="empty-content__action button is-primary" onClick={ this.props.actionCallback } href={ this.props.actionURL }>{ this.props.action }</a>;
		} else if ( this.props.actionURL ) {
			let targetProp = {};
			if ( this.props.actionTarget ) {
				targetProp = { target: this.props.actionTarget };
			}

			return <a className="empty-content__action button is-primary" href={ this.props.actionURL } { ...targetProp }>{ this.props.action }</a>;
		} else if ( this.props.actionCallback ) {
			return <a className="empty-content__action button is-primary" onClick={ this.props.actionCallback }>{ this.props.action }</a>;
		}
	},

	secondaryAction: function() {
		if ( 'string' !== typeof this.props.secondaryAction ) {
			return this.props.secondaryAction;
		}

		if ( this.props.secondaryActionURL && this.props.secondaryActionCallback ) {
			return <a className="empty-content__action button" onClick={ this.props.secondaryActionCallback } href={ this.props.secondaryActionURL }>{ this.props.secondaryAction }</a>;
		} else if ( this.props.secondaryActionURL ) {
			let targetProp = {};
			if ( this.props.actionTarget ) {
				targetProp = { target: this.props.secondaryActionTarget };
			}

			return <a className="empty-content__action button" href={ this.props.secondaryActionURL } { ...targetProp }>{ this.props.secondaryAction }</a>;
		} else if ( this.props.secondaryActionCallback ) {
			return <a className="empty-content__action button" onClick={ this.props.secondaryActionCallback }>{ this.props.secondaryAction }</a>;
		}
	},

	render: function() {
		var action, secondaryAction, illustration;

		if ( this.props.action ) {
			action = this.primaryAction();
		}

		if ( this.props.secondaryAction ) {
			secondaryAction = this.secondaryAction();
		}

		if ( this.props.illustration ) {
			illustration = <img src={ this.props.illustration } width={ this.props.illustrationWidth } className="empty-content__illustration" />;
		}

		return (
			<div className={ classNames( 'empty-content', this.props.className, { 'is-compact': this.props.isCompact } ) }>
				{ illustration }

				{
					this.props.title
					? <h2 className="empty-content__title">{ this.props.title }</h2>
					: null
				}

				{
					this.props.line
					? <h3 className="empty-content__line">{ this.props.line }</h3>
					: null
				}

				{ action }

				{ secondaryAction }
			</div>
		);
	}
} );
