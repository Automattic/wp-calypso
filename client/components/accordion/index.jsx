/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { noop } from 'lodash';
import classNames from 'classnames';
import Gridicon from 'gridicons';

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
			isExpanded: props.initialExpanded,
		};
	}

	toggleExpanded = () => {
		this.setExpandedStatus( ! this.state.isExpanded );
	};

	setExpandedStatus = isExpanded => {
		this.setState( { isExpanded } );
		this.props.onToggle( isExpanded );
	};

	_mountChildren = false;

	render() {
		const { className, icon, title, subtitle, status, children, e2eTitle } = this.props;
		const isExpanded = this.state.isExpanded || this.props.forceExpand;
		const classes = classNames( 'accordion', className, {
			'is-expanded': isExpanded,
			'has-icon': !! icon,
			'has-subtitle': !! subtitle,
			'has-status': !! status,
		} );

		// Keep children off the render tree until it's first expanded.
		this._mountChildren = this._mountChildren || isExpanded;

		return (
			<div
				className={ classes }
				data-e2e-title={ e2eTitle }
				data-tip-target={ `accordion-${ e2eTitle }` }
			>
				<header className="accordion__header">
					<button type="button" onClick={ this.toggleExpanded } className="accordion__toggle">
						{ icon && <span className="accordion__icon">{ icon }</span> }
						<span className="accordion__title">{ title }</span>
						{ subtitle && <span className="accordion__subtitle">{ subtitle }</span> }
						<span className="accordion__arrow">
							<Gridicon icon="dropdown" />
						</span>
					</button>
					{ status && <AccordionStatus { ...status } /> }
				</header>
				{ this._mountChildren && (
					<div className="accordion__content">
						<div className="accordion__content-wrap">{ children }</div>
					</div>
				) }
			</div>
		);
	}
}
