/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { noop } from 'lodash';
import classNames from 'classnames';

export default class Accordion extends Component {
	static propTypes = {
		initialExpanded: PropTypes.bool,
		onToggle: PropTypes.func,
		title: PropTypes.string.isRequired,
		subtitle: PropTypes.string,
		icon: PropTypes.element
	};

	static defaultProps = {
		initialExpanded: false,
		onToggle: noop
	};

	constructor( props ) {
		super( ...arguments );

		this.state = {
			isExpanded: props.initialExpanded
		};
	}

	toggleExpanded = () => {
		const isExpanded = ! this.state.isExpanded;
		this.setState( { isExpanded } );
		this.props.onToggle( isExpanded );
	}

	render() {
		const { className, icon, title, subtitle, children } = this.props;
		const classes = classNames( 'accordion', className, {
			'is-expanded': this.state.isExpanded,
			'has-icon': !! icon,
			'has-subtitle': !! subtitle
		} );

		return (
			<div className={ classes }>
				<header className="accordion__header">
					<button type="button" onTouchTap={ this.toggleExpanded } className="accordion__toggle">
						{ icon && <span className="accordion__icon">{ icon }</span> }
						<span className="accordion__title">{ title }</span>
						{ subtitle && <span className="accordion__subtitle">{ subtitle }</span> }
					</button>
				</header>
				<div className="accordion__content">
					<div className="accordion__content-wrap">
						{ children }
					</div>
				</div>
			</div>
		);
	}
}
