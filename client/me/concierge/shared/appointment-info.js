/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import 'moment-timezone';

/**
 * Internal dependencies
 */
import Confirmation from './confirmation';
import { CompactCard } from '@automattic/components';
import Site from 'calypso/blocks/site';
import FormattedHeader from 'calypso/components/formatted-header';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormButton from 'calypso/components/forms/form-button';
import { withLocalizedMoment } from 'calypso/components/localized-moment';

class AppointmentInfo extends Component {
	static propTypes = {
		appointment: PropTypes.object.isRequired,
	};

	renderAppointmentDetails() {
		const {
			appointment: { beginTimestamp, endTimestamp, id, scheduleId, meta },
			translate,
			moment,
			site,
		} = this.props;

		const conferenceLink = meta.conference_link || '';
		const guessedTimezone = moment.tz.guess();
		const isAllowedToChangeAppointment = meta.canChangeAppointment;

		return (
			<>
				<CompactCard className="shared__site-block">
					<Site siteId={ site.ID } />
				</CompactCard>

				<CompactCard>
					<FormattedHeader
						subHeaderText={ translate( 'Your scheduled Quick Start session details are:' ) }
					/>

					<FormFieldset>
						<FormLabel>
							{ conferenceLink
								? translate( 'Session link' )
								: translate(
										'A link to start the session will appear here a few minutes before the session'
								  ) }
						</FormLabel>
						<div className="shared__appointment-info-start-session">
							<FormTextInput
								name="conferenceLink"
								value={ conferenceLink }
								disabled="disabled"
								placeholder="Screen share URL (check back before the session starts)"
							/>
							{ conferenceLink && (
								<a href={ conferenceLink } target="_blank" rel="noopener noreferrer">
									<FormButton isPrimary={ true } type="button">
										{ translate( 'Start session' ) }
									</FormButton>
								</a>
							) }
						</div>
					</FormFieldset>

					<FormFieldset>
						<FormLabel>{ translate( 'When?' ) }</FormLabel>
						<FormSettingExplanation>
							{ moment( beginTimestamp ).format( 'llll - ' ) }
							{ moment.tz( endTimestamp, guessedTimezone ).format( 'LT z' ) }{ ' ' }
							{ `(${ guessedTimezone })` }
						</FormSettingExplanation>
					</FormFieldset>

					<FormFieldset>
						<FormLabel>
							{ translate( 'What are you hoping to accomplish with your site?' ) }
						</FormLabel>
						<FormSettingExplanation>{ meta.message }</FormSettingExplanation>
					</FormFieldset>

					{ isAllowedToChangeAppointment && (
						<FormFieldset>
							<a href={ `/me/concierge/${ site.slug }/${ id }/cancel` } rel="noopener noreferrer">
								<FormButton isPrimary={ false } type="button">
									{ translate( 'Reschedule or cancel' ) }
								</FormButton>
							</a>
						</FormFieldset>
					) }

					{ scheduleId === 1 ? (
						<>
							<br />
							<FormSettingExplanation>
								{ translate(
									'Note: You have two free sessions with your plan. If you are unable to attend a ' +
										'session, you may cancel or reschedule it at least one hour in advance so that it ' +
										'does not count towards your session total.'
								) }
							</FormSettingExplanation>
						</>
					) : (
						<>
							<br />
							<FormSettingExplanation>
								{ translate(
									'Note: You have %(days)d days from the date of purchase to cancel an unused Quick Start ' +
										'session and receive a refund. Please note, if you miss a scheduled session twice, ' +
										'the purchase will be cancelled without a refund.',
									{ args: { days: 14 } }
								) }
							</FormSettingExplanation>
						</>
					) }
				</CompactCard>
			</>
		);
	}

	render() {
		const {
			appointment: { beginTimestamp, endTimestamp },
			translate,
			moment,
		} = this.props;

		const beginTimeFormat = translate( 'LL [at] LT', {
			comment:
				'moment.js formatting string. See http://momentjs.com/docs/#/displaying/format/.' +
				'e.g. Thursday, December 20, 2018 at 8PM.',
		} );

		return (
			<div>
				<Confirmation
					title={ translate( 'Your upcoming appointment' ) }
					description={ translate(
						'We can talk about anything related to your site. ' +
							'Get all your questions ready ' +
							'-- we look forward to chatting!',
						{
							args: {
								beginTime: moment( beginTimestamp ).format( beginTimeFormat ),
								duration: moment( endTimestamp ).diff( beginTimestamp, 'minutes' ),
							},
						}
					) }
				/>
				{ this.renderAppointmentDetails() }
			</div>
		);
	}
}

export default localize( withLocalizedMoment( AppointmentInfo ) );
