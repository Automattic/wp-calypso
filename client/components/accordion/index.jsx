/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { noop } from 'lodash';
import classNames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import AccordionStatus from './status';

export default class Accordion extends Component {
	static propTypes = {
		isExpanded: PropTypes.bool,
		onToggle: PropTypes.func,
		title: PropTypes.string.isRequired,
		subtitle: PropTypes.string,
		status: PropTypes.object,
		icon: PropTypes.element,
	};

	static defaultProps = {
		isExpanded: false,
		onToggle: noop
	};

	constructor( props ) {
		super( ...arguments );

		this.state = {
			isExpanded: props.isExpanded
		};
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.isExpanded !== nextProps.isExpanded ) {
			this.setExpandedStatus( nextProps.isExpanded );
		}
	}

	toggleExpanded = () => {
		this.setExpandedStatus( ! this.state.isExpanded );
	};

	setExpandedStatus = ( expandedStatus ) => {
		this.setState( { isExpanded: expandedStatus } );
		this.props.onToggle( expandedStatus );
	};

	render() {
		const { className, icon, title, subtitle, status, children } = this.props;
		const classes = classNames( 'accordion', className, {
			'is-expanded': this.state.isExpanded,
			'has-icon': !! icon,
			'has-subtitle': !! subtitle,
			'has-status': !! status
		} );

		return (
			<div className={ classes }>
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
