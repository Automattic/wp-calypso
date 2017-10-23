/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { flowRight, get, isArray } from 'lodash';
import { localize } from 'i18n-calypso';
/**
 * Internal dependencies
 */
import DisconnectJetpack from 'blocks/disconnect-jetpack';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import Main from 'components/main';
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

	submitSurvey = () => {
		const { moment, purchase, reason, site, siteId, text } = this.props;

		const reasonWhitelist = {
			'missing-feature': 'didNotInclude',
			'too-difficult': 'tooHard',
			'too-expensive': 'onlyNeedFree',
		};

		const surveyData = {
			'why-cancel': {
				response: get( reasonWhitelist, reason ),
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
		const { siteId, siteSlug, translate } = this.props;

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
