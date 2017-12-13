/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import CompactCard from 'components/card/compact';
import PrimaryHeader from './primary-header';
import Site from 'blocks/site';

class Upsell extends Component {
	static propTypes = {
		site: PropTypes.object.isRequired,
	};

	render() {
		return (
			<div>
				<PrimaryHeader />
				<CompactCard className="concierge__site-block">
					<Site siteId={ this.props.site.ID } />
				</CompactCard>
				<CompactCard>
					<p>Only sites on a Business Plan are eligible for a concierge site setup chat.</p>
					<Button href={ `/plans/${ this.props.site.slug }` } primary>
						Upgrade to Business
					</Button>
				</CompactCard>
			</div>
		);
	}
}

export default Upsell;
