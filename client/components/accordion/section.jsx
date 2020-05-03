/**
 * External dependencies
 */

import React, { Component } from 'react';
import classNames from 'classnames';

export default class AccordionSection extends Component {
	render() {
		return (
			<section className={ classNames( 'accordion__section', this.props.className ) }>
				{ this.props.children }
			</section>
		);
	}
}
