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
import Site from 'blocks/site';
import { recordTracksEvent } from 'state/analytics/actions';
import { isBusiness, isEcommerce } from 'lib/products-values';
import { abtest } from 'lib/abtest';

class Upsell extends Component {
	static propTypes = {
		site: PropTypes.object.isRequired,
	};

	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_concierge_book_upsell_step' );
	}

	getUpsellForIncludedSessions( text ) {
		const { translate } = this.props;

		return (
			<CompactCard>
				<p>
					{ text } { translate( 'Purchase a new Quick Start session by clicking below.' ) }
				</p>
				<Button href={ `/checkout/offer-quickstart-session/${ this.props.site.slug }` } primary>
					{ translate( 'Learn More' ) }
				</Button>
			</CompactCard>
		);
	}

	getUpsellForABTest() {
		const { translate } = this.props;

		if ( 'variationShowConciergeUpsell' === abtest( 'purchaseConciergeAppointmentUpsell' ) ) {
			const text = translate( "You don't have available Quick Start sessions." );
			return this.getUpsellForIncludedSessions( text );
		}

		return (
			<CompactCard>
				<p>
					{ translate( 'Only sites on a Business or higher plan are eligible for a session.' ) }
				</p>
				<Button href={ `/plans/${ this.props.site.slug }` } primary>
					{ translate( 'Upgrade to Business' ) }
				</Button>
			</CompactCard>
		);
	}

	render() {
		const { site, translate } = this.props;

		const text = translate( 'You have exhausted your complimentary sessions.' );
		const upsellContent =
			isBusiness( site.plan ) || isEcommerce( site.plan )
				? this.getUpsellForIncludedSessions( text )
				: this.getUpsellForABTest();

		return (
			<div>
				<PrimaryHeader />
				<CompactCard className="shared__site-block">
					<Site siteId={ this.props.site.ID } />
				</CompactCard>

				{ upsellContent }
			</div>
		);
	}
}

export default connect( null, { recordTracksEvent } )( localize( Upsell ) );
