import page from '@automattic/calypso-router';
import { Button, Card } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { MAP_EXISTING_DOMAIN } from '@automattic/urls';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import { getTransferRestrictionMessage } from '../use-my-domain/utilities';

class TransferRestrictionMessage extends PureComponent {
	static propTypes = {
		creationDate: PropTypes.string,
		domain: PropTypes.string,
		goBack: PropTypes.func,
		mapDomainUrl: PropTypes.string,
		selectedSiteSlug: PropTypes.string,
		termMaximumInYears: PropTypes.number,
		transferEligibleDate: PropTypes.string,
		transferRestrictionStatus: PropTypes.string,
	};

	goToMapDomainStep = ( event ) => {
		event.preventDefault();
		page( this.props.mapDomainUrl );
	};

	render() {
		const { domain, goBack, transferEligibleDate, translate, moment } = this.props;

		const transferEligibleMoment = moment( transferEligibleDate );

		const heading = translate(
			'{{strong}}%(domain)s{{/strong}} can be transferred in %(transferDelayInDays)s days.',
			{
				args: {
					domain,
					transferDelayInDays: transferEligibleMoment.diff( moment(), 'days' ),
				},
				components: {
					strong: <strong />,
				},
			}
		);

		const message = translate(
			"You don't have to wait though. Connect your domain to your site now, without transferring it. " +
				'{{a}}Learn how{{/a}}.',
			{
				components: {
					a: (
						<a
							href={ localizeUrl( MAP_EXISTING_DOMAIN ) }
							rel="noopener noreferrer"
							target="_blank"
						/>
					),
				},
			}
		);

		const reason = getTransferRestrictionMessage( this.props );

		return (
			<Card>
				<div className="transfer-domain-step__section is-expanded">
					<div className="transfer-domain-step__section-text">
						<div className="transfer-domain-step__section-heading">
							<FormattedHeader headerText={ heading } />
						</div>
						<div>
							<div className="transfer-domain-step__section-message">
								{ message }
								<br />
								<br />
								{ reason }
							</div>
							<div className="transfer-domain-step__section-action">
								<Button
									className="transfer-domain-step__section-action-button"
									compact
									onClick={ this.goToMapDomainStep }
								>
									{ translate( 'Connect domain without transferring' ) }
								</Button>
								<Button
									className="transfer-domain-step__section-action-button"
									compact
									onClick={ goBack }
								>
									{ translate( 'Transfer different domain' ) }
								</Button>
							</div>
						</div>
					</div>
				</div>
			</Card>
		);
	}
}

export default localize( withLocalizedMoment( TransferRestrictionMessage ) );
