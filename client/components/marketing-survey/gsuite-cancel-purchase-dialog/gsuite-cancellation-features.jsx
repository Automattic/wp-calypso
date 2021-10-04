import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import GSuiteFeatures from 'calypso/components/gsuite/gsuite-features';
import GSuiteLearnMore from 'calypso/components/gsuite/gsuite-learn-more';
import { getSelectedDomain } from 'calypso/lib/domains';
import { getGoogleMailServiceFamily, getGSuiteSubscriptionStatus } from 'calypso/lib/gsuite';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';

class GSuiteCancellationFeatures extends Component {
	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_purchases_gsuite_remove_purchase_features_view' );
	}

	handleLearnMoreClick = () => {
		this.props.recordTracksEvent( 'calypso_purchases_gsuite_remove_purchase_learn_more_click' );
	};

	getAccessMessage = () => {
		const { selectedDomain, purchase, translate } = this.props;
		const { meta: domainName, productSlug } = purchase;
		const googleMailService = getGoogleMailServiceFamily( productSlug );
		const googleSubscriptionStatus = getGSuiteSubscriptionStatus( selectedDomain );

		if ( [ 'suspended', '' ].includes( googleSubscriptionStatus ) ) {
			return translate(
				'If you cancel your subscription for %(domainName)s now, {{strong}}you will lose access to all of ' +
					'your %(googleMailService)s features immediately{{/strong}}, and you will ' +
					'need to purchase a new subscription with Google if you wish to regain access to them.',
				{
					args: {
						domainName,
						googleMailService,
					},
					comment:
						'%(domainName) is the name of the domain (e.g. example.com) ' +
						'%(googleMailService)s can be either "G Suite" or "Google Workspace" ',
					components: {
						strong: <strong />,
					},
				}
			);
		}

		return translate(
			'If you cancel your subscription for %(domainName)s now, {{strong}}you will lose access to all of ' +
				'your %(googleMailService)s features in %(days)d days{{/strong}}. After that time, ' +
				'you will need to purchase a new subscription with Google if you wish to regain access to them.',
			{
				args: {
					domainName,
					googleMailService,
					days: 30,
				},
				comment:
					'%(domainName) is the name of the domain (e.g. example.com) ' +
					'%(googleMailService)s can be either "G Suite" or "Google Workspace" ' +
					"and %(days)d is a number of days (usually '30')",
				components: {
					strong: <strong />,
				},
			}
		);
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

				<CardHeading tagName="h3" size={ 20 }>
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
};

export default connect(
	( state, { purchase } ) => {
		return {
			selectedDomain: getSelectedDomain( {
				domains: getDomainsBySiteId( state, purchase.siteId ),
				selectedDomainName: purchase.meta,
			} ),
		};
	},
	{
		recordTracksEvent,
	}
)( localize( GSuiteCancellationFeatures ) );
