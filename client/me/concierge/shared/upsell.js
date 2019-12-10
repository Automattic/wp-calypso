/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button, CompactCard } from '@automattic/components';
import PrimaryHeader from './primary-header';
import Site from 'blocks/site';

class Upsell extends Component {
	static propTypes = {
		site: PropTypes.object.isRequired,
	};

	render() {
		const { translate } = this.props;
		return (
			<div>
				<PrimaryHeader />
				<CompactCard className="shared__site-block">
					<Site siteId={ this.props.site.ID } />
				</CompactCard>
				<CompactCard>
					<p>
						{ translate( 'Only sites on a Business or higher plan are eligible for a session.' ) }
					</p>
					<Button href={ `/plans/${ this.props.site.slug }` } primary>
						{ translate( 'Upgrade to Business' ) }
					</Button>
				</CompactCard>
			</div>
		);
	}
}

export default localize( Upsell );
