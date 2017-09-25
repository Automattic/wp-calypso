/**
 * External dependencies
 */
import classNames from 'classnames';
import React, { Component } from 'react';

export default class AccordionSection extends Component {
	render() {
		return (
			<section className={ classNames( 'accordion__section', this.props.className ) } >
				{ this.props.children }
			</section>
		);
	}
}
