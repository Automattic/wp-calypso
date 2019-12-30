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

	getBusinessPlanUpgradeUpsell() {
		const { site, translate } = this.props;

		return (
			<CompactCard>
				<p>
					{ translate( 'Only sites on a Business or higher plan are eligible for a session.' ) }
				</p>
				<Button href={ `/plans/${ site.slug }` } primary>
					{ translate( 'Upgrade to Business' ) }
				</Button>
			</CompactCard>
		);
	}

	getPurchaseConciergeUpsell() {
		const { site, translate } = this.props;

		return (
			<CompactCard>
				<p>
					{ translate( 'You have used up your available Quick Start sessions.' ) }
					{ translate( 'Purchase a new Quick Start session by clicking below.' ) }
				</p>
				<Button href={ `/checkout/offer-quickstart-session/${ site.slug }` } primary>
					{ translate( 'Learn More' ) }
				</Button>
			</CompactCard>
		);
	}

	getConciergeUpsellContent() {
		const { site } = this.props;

		const isEligibleForIncludedSessions = isBusiness( site.plan ) || isEcommerce( site.plan );

		if (
			isEligibleForIncludedSessions ||
			'variationShowConciergeUpsell' === abtest( 'purchaseConciergeAppointmentUpsell' )
		) {
			return this.getPurchaseConciergeUpsell();
		}

		return this.getBusinessPlanUpgradeUpsell();
	}

	render() {
		return (
			<div>
				<PrimaryHeader />
				<CompactCard className="shared__site-block">
					<Site siteId={ this.props.site.ID } />
				</CompactCard>
				{ this.getConciergeUpsellContent() }
			</div>
		);
	}
}

export default connect( null, { recordTracksEvent } )( localize( Upsell ) );
