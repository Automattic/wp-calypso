/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import Card from 'components/card';
import SectionHeader from 'components/section-header';

export default class Checkout extends Component {

	static propTypes = {
		className: PropTypes.string,
	};

	render() {
		return (
			<Main className={ classNames( 'checkout', this.props.className ) }>
				<SectionHeader label="Store Location and Currency" />
				<Card>
					Checkout settings go here
				</Card>
			</Main>
		);
	}

}
