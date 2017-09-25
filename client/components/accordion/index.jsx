/**
 * External dependencies
 */
import classNames from 'classnames';
import Gridicon from 'gridicons';
import { noop } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import AccordionStatus from './status';

export default class Accordion extends Component {
	static propTypes = {
		initialExpanded: PropTypes.bool,
		forceExpand: PropTypes.bool,
		onToggle: PropTypes.func,
		title: PropTypes.string.isRequired,
		subtitle: PropTypes.string,
		status: PropTypes.object,
		icon: PropTypes.element,
		e2eTitle: PropTypes.string,
	};

	static defaultProps = {
		initialExpanded: false,
		forceExpand: false,
		onToggle: noop,
	};

	constructor( props ) {
		super( ...arguments );

		this.state = {
			isExpanded: props.initialExpanded
		};
	}

	toggleExpanded = () => {
		this.setExpandedStatus( ! this.state.isExpanded );
	};

	setExpandedStatus = ( isExpanded ) => {
		this.setState( { isExpanded } );
		this.props.onToggle( isExpanded );
	};

	render() {
		const { className, icon, title, subtitle, status, children, e2eTitle } = this.props;
		const classes = classNames( 'accordion', className, {
			'is-expanded': this.state.isExpanded || this.props.forceExpand,
			'has-icon': !! icon,
			'has-subtitle': !! subtitle,
			'has-status': !! status
		} );

		return (
			<div className={ classes } data-e2e-title={ e2eTitle }>
				<header className="accordion__header">
					<button type="button" onClick={ this.toggleExpanded } className="accordion__toggle">
						{ icon && <span className="accordion__icon">{ icon }</span> }
						<span className="accordion__title">{ title }</span>
						{ subtitle && <span className="accordion__subtitle">{ subtitle }</span> }
						<span className="accordion__arrow"><Gridicon icon="dropdown" /></span>
					</button>
					{ status && <AccordionStatus { ...status } /> }
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
