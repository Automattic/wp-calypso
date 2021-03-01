/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button, CompactCard } from '@automattic/components';
import PrimaryHeader from './primary-header';
import Site from 'calypso/blocks/site';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

class Upsell extends Component {
	static propTypes = {
		site: PropTypes.object.isRequired,
	};

	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_concierge_book_upsell_step' );
	}

	render() {
		const { site, translate } = this.props;
		return (
			<div>
				<PrimaryHeader />
				<CompactCard className="shared__site-block">
					<Site siteId={ site.ID } />
				</CompactCard>
				<CompactCard>
					<p>
						{ translate( 'You do not have any available Quick Start sessions.' ) }{ ' ' }
						{ translate( 'Click the button to purchase a new session.' ) }
					</p>
					<Button href={ `/checkout/offer-quickstart-session/${ site.slug }` } primary>
						{ translate( 'Learn More' ) }
					</Button>
				</CompactCard>
			</div>
		);
	}
}

export default connect( null, { recordTracksEvent } )( localize( Upsell ) );
