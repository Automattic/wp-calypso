/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { noop } from 'lodash';
import classNames from 'classnames';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import AccordionStatus from './status';

/**
 * Style dependencies
 */
import './style.scss';

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
			hasExpanded: false,
		};
	}

	static getDerivedStateFromProps( props, state ) {
		// in order to improve the performance, hasExpanded determines if the
		// accordion content should be rendered or not. the content has to
		// be rendered as soon as the accordion is expanded manually
		// (isExpanded) or forced (forceExpand) or if it has been previously
		// expanded
		if ( state.isExpanded || props.forceExpand ) {
			return { hasExpanded: true };
		}
		return null;
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
		const isExpanded = this.state.isExpanded || this.props.forceExpand;
		const { hasExpanded } = this.state;
		const classes = classNames( 'accordion', className, {
			'is-expanded': isExpanded,
			'has-icon': !! icon,
			'has-subtitle': !! subtitle,
			'has-status': !! status,
		} );

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
				{ hasExpanded && (
					<div className="accordion__content">
						<div className="accordion__content-wrap">{ children }</div>
					</div>
				) }
			</div>
		);
	}
}
