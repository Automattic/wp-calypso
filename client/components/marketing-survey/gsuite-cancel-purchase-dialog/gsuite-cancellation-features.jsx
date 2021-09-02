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

	getAccessMessage = () => {
		const { googleSubscriptionStatus, translate, purchase } = this.props;
		const { meta: domainName, productSlug } = purchase;

		const googleMailService = getGoogleMailServiceFamily( productSlug );

		const accessMessage =
			googleSubscriptionStatus === 'suspended'
				? translate(
						'If you cancel your subscription for %(domainName)s now, {{strong}}you will lose access to all of ' +
							'your %(googleMailService)s features immediately{{/strong}}, and you will ' +
							'need to purchase a new subscription with Google if you wish to regain access to the features.',
						{
							args: {
								domainName,
								googleMailService,
							},
							comment:
								'%(domainName) is the name of the domain, e.g. example.com; ' +
								'%(googleMailService)s can be either "G Suite" or "Google Workspace" ',
							components: {
								strong: <strong />,
							},
						}
				  )
				: translate(
						'If you cancel your subscription for %(domainName)s now, {{strong}}you will lose access to all of ' +
							'your %(googleMailService)s features in %(days)s days{{/strong}}. After that time, ' +
							'you will need to purchase a new subscription with Google.',
						{
							args: {
								domainName,
								googleMailService,
								days: '30',
							},
							comment:
								'%(domainName) is the name of the domain, e.g. example.com; ' +
								'%(googleMailService)s can be either "G Suite" or "Google Workspace" ',
							components: {
								strong: <strong />,
							},
						}
				  );

		return accessMessage;
	};

	render() {
		const { purchase, translate } = this.props;
		const { meta: domainName, productSlug } = purchase;

		return (
			<div className="gsuite-cancel-purchase-dialog__features">
				<CardHeading tagName="h3" size={ 24 }>
					{ translate( 'Are you sure?' ) }
				</CardHeading>

				<p>{ this.getAccessMessage() }</p>

				<CardHeading tagName="h3" size={ 24 }>
					{ translate( "Here’s what you'll be missing:" ) }
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
	googleSubscriptionStatus: PropTypes.string,
};

export default connect( null, {
	recordTracksEvent,
} )( localize( GSuiteCancellationFeatures ) );
