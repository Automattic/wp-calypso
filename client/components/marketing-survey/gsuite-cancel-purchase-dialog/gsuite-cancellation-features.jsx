import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import GSuiteFeatures from 'calypso/components/gsuite/gsuite-features';
import GSuiteLearnMore from 'calypso/components/gsuite/gsuite-learn-more';
import { getGoogleMailServiceFamily } from 'calypso/lib/gsuite';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

class GSuiteCancellationFeatures extends Component {
	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_purchases_gsuite_remove_purchase_features_view' );
	}

	handleLearnMoreClick = () => {
		this.props.recordTracksEvent( 'calypso_purchases_gsuite_remove_purchase_learn_more_click' );
	};

	getTimePeriod = () => {
		const { status, translate } = this.props;
		return status === 'suspended'
			? translate( 'immediately' )
			: translate( 'in %(days)s days', { args: { days: '30' }, comment: 'Number of days' } );
	};

	render() {
		const { purchase, translate } = this.props;
		const { meta: domainName, productSlug } = purchase;

		return (
			<div className="gsuite-cancel-purchase-dialog__features">
				<CardHeading tagName="h3" size={ 24 }>
					{ translate( 'Are you sure?' ) }
				</CardHeading>

				<p>
					{ translate(
						'If you cancel your subscription now, you will lose access to all of ' +
							'your %(googleMailService)s features %(days)s. After that time, ' +
							'you will need to start a new subscription with Google or another reseller.',
						{
							args: {
								googleMailService: getGoogleMailServiceFamily( productSlug ),
								days: this.getTimePeriod(),
							},
							comment:
								'%(googleMailService)s can be either "G Suite" or "Google Workspace" and %(days)s might be "immediately" or "after 30 days"',
						}
					) }
				</p>

				<CardHeading tagName="h3" size={ 24 }>
					{ translate( "Here’s what you'll be missing" ) }
				</CardHeading>

				<GSuiteFeatures productSlug={ productSlug } domainName={ domainName } type={ 'list' } />

				<GSuiteLearnMore onClick={ this.handleLearnMoreClick } productSlug={ productSlug } />
			</div>
		);
	}
}

GSuiteCancellationFeatures.propTypes = {
	purchase: PropTypes.object.isRequired,
	recordTracksEvent: PropTypes.func.isRequired,
	translate: PropTypes.func.isRequired,
};

export default connect( null, {
	recordTracksEvent,
} )( localize( GSuiteCancellationFeatures ) );
