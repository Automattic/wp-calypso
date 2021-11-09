import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import DisconnectJetpack from 'calypso/blocks/disconnect-jetpack';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import enrichedSurveyData from 'calypso/components/marketing-survey/cancel-purchase-form/enriched-survey-data';
import NavigationLink from 'calypso/components/wizard/navigation-link';
import { submitSurvey } from 'calypso/lib/purchases/actions';
import redirectNonJetpack from 'calypso/my-sites/site-settings/redirect-non-jetpack';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';

class ConfirmDisconnection extends Component {
	static propTypes = {
		reason: PropTypes.string,
		type: PropTypes.string,
		text: PropTypes.oneOfType( [ PropTypes.string, PropTypes.arrayOf( PropTypes.string ) ] ),
		// Provided by HOCs
		purchase: PropTypes.object,
		siteId: PropTypes.number,
		siteSlug: PropTypes.string,
		translate: PropTypes.func,
	};

	static allowedReasons = [
		'troubleshooting',
		'cannot-work',
		'slow',
		'buggy',
		'no-clarity',
		'delete',
		'other',
	];

	submitSurvey = () => {
		const { purchase, reason, siteId, text } = this.props;

		const surveyData = {
			'why-cancel': {
				response: this.constructor.allowedReasons.find( ( r ) => r === reason ),
				text: Array.isArray( text ) ? text.join() : text,
			},
			source: {
				from: 'Calypso',
			},
		};

		this.props.submitSurvey(
			'calypso-disconnect-jetpack-july2019',
			siteId,
			enrichedSurveyData( surveyData, purchase )
		);
	};

	render() {
		const { type, siteId, siteSlug, translate } = this.props;

		const backHref =
			`/settings/disconnect-site/${ siteSlug }` +
			( type ? `?type=${ encodeURIComponent( type ) }` : '' );

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
					<NavigationLink href={ backHref } direction="back" />
				</div>
			</Main>
		);
	}
}

const connectComponent = connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		return {
			purchase: getCurrentPlan( state, siteId ),
			site: getSelectedSite( state ),
			siteId,
			siteSlug: getSelectedSiteSlug( state ),
		};
	},
	{ submitSurvey }
);

export default connectComponent( localize( redirectNonJetpack()( ConfirmDisconnection ) ) );
