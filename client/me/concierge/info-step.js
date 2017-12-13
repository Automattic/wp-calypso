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

class InfoStep extends Component {
	static propTypes = {
		onComplete: PropTypes.func.isRequired,
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
					<p>
						<em>TODO: Add form questions here</em>
					</p>
					<Button onClick={ this.props.onComplete }>Continue to calendar</Button>
				</CompactCard>
			</div>
		);
	}
}

export default InfoStep;
