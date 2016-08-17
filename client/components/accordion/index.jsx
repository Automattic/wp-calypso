/**
 * External dependencies
 */
import React from 'react';
import { noop } from 'lodash';
import classNames from 'classnames';

module.exports = React.createClass( {
	displayName: 'Accordion',

	propTypes: {
		initialExpanded: React.PropTypes.bool,
		onToggle: React.PropTypes.func,
		title: React.PropTypes.string.isRequired,
		subtitle: React.PropTypes.string,
		icon: React.PropTypes.oneOfType( [
			React.PropTypes.string,
			React.PropTypes.element
		] )
	},

	getInitialState: function() {
		return {
			isExpanded: this.props.initialExpanded
		};
	},

	getDefaultProps: function() {
		return {
			onToggle: noop
		};
	},

	toggleExpanded: function() {
		const isExpanded = ! this.state.isExpanded;

		this.setState( {
			isExpanded: isExpanded
		} );

		this.props.onToggle( isExpanded );
	},

	renderIcon: function() {
		if ( ! this.props.icon ) {
			return;
		}

		if ( 'string' === typeof this.props.icon ) {
			return <span className={ classNames( 'accordion__icon', this.props.icon ) } />;
		}

		return <span className="accordion__icon">{ this.props.icon }</span>;
	},

	renderSubtitle: function() {
		if ( this.props.subtitle ) {
			return <span className="accordion__subtitle">{ this.props.subtitle }</span>;
		}
	},

	renderHeader: function() {
		const classes = classNames( 'accordion__header', {
			'has-icon': !! this.props.icon,
			'has-subtitle': !! this.props.subtitle
		} );

		return (
			<header className={ classes }>
				<button type="button" onTouchTap={ this.toggleExpanded } className="accordion__toggle">
					{ this.renderIcon() }
					<span className="accordion__title">{ this.props.title }</span>
					{ this.renderSubtitle() }
				</button>
			</header>
		);
	},

	render: function() {
		const classes = classNames( 'accordion', this.props.className, {
			'is-expanded': this.state.isExpanded
		} );

		return (
			<div className={ classes }>
				{ this.renderHeader() }
				<div ref="content" className="accordion__content">
					<div className="accordion__content-wrap">
						{ this.props.children }
					</div>
				</div>
			</div>
		);
	}
} );
