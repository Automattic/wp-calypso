/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { localize, moment } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import FormattedHeader from 'components/formatted-header';
import { MAP_EXISTING_DOMAIN } from 'lib/url/support';
import paths from 'my-sites/domains/paths';

class TransferRestrictionMessage extends React.PureComponent {
	static propTypes = {
		creationDate: PropTypes.string,
		domain: PropTypes.string,
		selectedSiteSlug: PropTypes.string,
		termMaximumInYears: PropTypes.number,
		transferEligibleDate: PropTypes.string,
		transferRestrictionStatus: PropTypes.string,
	};

	goToMapDomainStep = event => {
		event.preventDefault();
		page( paths.domainMapping( this.props.selectedSiteSlug, this.props.domain ) );
	};

	render() {
		const {
			creationDate,
			domain,
			termMaximumInYears,
			transferEligibleDate,
			transferRestrictionStatus,
			translate,
		} = this.props;

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
					a: <a href={ MAP_EXISTING_DOMAIN } rel="noopener noreferrer" target="_blank" />,
				},
			}
		);

		let reason = null;

		if ( 'max_term' === transferRestrictionStatus ) {
			reason = translate(
				'Transferring this domain would extend the registration period beyond the maximum allowed term ' +
					'of %(termMaximumInYears)d years. It can be transferred starting %(transferEligibleDate)s.',
				{
					args: {
						termMaximumInYears: termMaximumInYears,
						transferEligibleDate: transferEligibleMoment.format( 'LL' ),
					},
				}
			);
		} else if ( 'initial_registration_period' === transferRestrictionStatus ) {
			reason = translate(
				'Newly-registered domains are not eligible for transfer. {{strong}}%(domain)s{{/strong}} was registered ' +
					'%(daysAgoRegistered)s days ago, and can be transferred starting %(transferEligibleDate)s.',
				{
					args: {
						domain: domain,
						daysAgoRegistered: moment().diff( moment( creationDate ), 'days' ),
						transferEligibleDate: transferEligibleMoment.format( 'LL' ),
					},
					components: {
						strong: <strong />,
					},
				}
			);
		}

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
								<Button compact onClick={ this.goToMapDomainStep }>
									{ translate( 'Connect domain without transferring' ) }
								</Button>
							</div>
						</div>
					</div>
				</div>
			</Card>
		);
	}
}

export default localize( TransferRestrictionMessage );
