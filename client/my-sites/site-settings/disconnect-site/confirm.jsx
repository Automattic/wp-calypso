/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compact, find, flowRight, isArray, without } from 'lodash';
import { localize } from 'i18n-calypso';
/**
 * Internal dependencies
 */
import DisconnectJetpack from 'blocks/disconnect-jetpack';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import Main from 'components/main';
import NavigationLink from 'components/wizard/navigation-link';
import enrichedSurveyData from 'components/marketing-survey/cancel-purchase-form/enrichedSurveyData';
import { submitSurvey } from 'lib/upgrades/actions';
import Placeholder from 'my-sites/site-settings/placeholder';
import redirectNonJetpack from 'my-sites/site-settings/redirect-non-jetpack';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { getCurrentPlan } from 'state/sites/plans/selectors';

class ConfirmDisconnection extends PureComponent {
	static propTypes = {
		reason: PropTypes.string,
		text: PropTypes.oneOfType( [ PropTypes.string, PropTypes.arrayOf( PropTypes.string ) ] ),
		// Provided by HOCs
		moment: PropTypes.func,
		purchase: PropTypes.object,
		siteId: PropTypes.number,
		siteSlug: PropTypes.string,
		translate: PropTypes.func,
	};

	static reasonWhitelist = [
		'missing-feature',
		'too-difficult',
		'too-expensive',
		'troubleshooting',
		'other',
	];

	submitSurvey = () => {
		const { moment, purchase, reason, site, siteId, text } = this.props;

		const surveyData = {
			'why-cancel': {
				response: find( this.constructor.reasonWhitelist, r => r === reason ),
				text: isArray( text ) ? text.join() : text,
			},
		};

		submitSurvey(
			'calypso-disconnect-jetpack',
			siteId,
			enrichedSurveyData( surveyData, moment(), site, purchase )
		);
	};

	render() {
		const { reason, siteId, siteSlug, translate } = this.props;
		const previousStep = find(
			without( this.constructor.reasonWhitelist, 'troubleshooting', 'other' ), // Redirect those back to initial survey
			r => r === reason
		);

		if ( ! siteId ) {
			return <Placeholder />;
		}

		return (
			<Main className="disconnect-site__confirm">
				<DocumentHead title={ translate( 'Site Settings' ) } />
				<FormattedHeader
					headerText={ translate( 'Confirm Disconnection' ) }
					subHeaderText={ translate(
						'Confirm that you want to disconnect your site from WordPress.com.'
					) }
				/>
				<DisconnectJetpack
					disconnectHref="/stats"
					isBroken={ false }
					onDisconnectClick={ this.submitSurvey }
					showTitle={ false }
					siteId={ siteId }
					stayConnectedHref={ '/settings/manage-connection/' + siteSlug }
				/>
				<div className="disconnect-site__navigation-links">
					<NavigationLink
						href={
							'/settings/disconnect-site/' + compact( [ previousStep, siteSlug ] ).join( '/' )
						}
						direction="back"
					/>
				</div>
			</Main>
		);
	}
}

const connectComponent = connect( state => {
	const siteId = getSelectedSiteId( state );
	return {
		purchase: getCurrentPlan( state, siteId ),
		site: getSelectedSite( state ),
		siteId,
		siteSlug: getSelectedSiteSlug( state ),
	};
} );

export default flowRight( connectComponent, localize, redirectNonJetpack() )(
	ConfirmDisconnection
);
