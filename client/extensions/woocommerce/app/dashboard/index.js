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

export default class Dashboard extends Component {

	static propTypes = {
		className: PropTypes.string,
	};

	render() {
		return (
			<Main className={ classNames( 'dashboard', this.props.className ) }>
				<SectionHeader label="WooCommerce Store" />
				<Card>
					<p>This is the start of something great!</p>
					<p>This will be the home for your WooCommerce Store integration with WordPress.com.</p>
				</Card>
			</Main>
		);
	}

}
