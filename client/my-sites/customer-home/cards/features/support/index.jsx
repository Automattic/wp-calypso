/**
 * External dependencies
 */
import { Card } from '@automattic/components';
import React from 'react';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import CardHeading from 'components/card-heading';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';
import { localizeUrl } from 'lib/i18n-utils';
import { composeAnalytics, recordTracksEvent, bumpStat } from 'state/analytics/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteOption } from 'state/sites/selectors';
import { getSelectedEditor } from 'state/selectors/get-selected-editor';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Image dependencies
 */
import happinessIllustration from 'assets/images/customer-home/happiness.png';

const Support = ( { trackContactAction, trackDocsAction } ) => {
	const translate = useTranslate();

	return (
		<Card className="support">
			<CardHeading>{ translate( 'Support' ) }</CardHeading>
			<h6 className="support__header customer-home__card-subheader">
				{ translate( 'Get all the help you need' ) }
			</h6>
			<div className="support__content">
				<img src={ happinessIllustration } alt={ translate( 'Support' ) } />
				<VerticalNav>
					<VerticalNavItem
						path={ localizeUrl( 'https://wordpress.com/support' ) }
						external
						onClick={ trackDocsAction }
					>
						{ translate( 'Support articles' ) }
					</VerticalNavItem>
					<VerticalNavItem path="/help/contact" external onClick={ trackContactAction }>
						{ translate( 'Contact us' ) }
					</VerticalNavItem>
				</VerticalNav>
			</div>
		</Card>
	);
};

const mapStateToProps = state => {
	const siteId = getSelectedSiteId( state );
	const isClassicEditor = getSelectedEditor( state, siteId ) === 'classic';
	const isStaticHomePage =
		! isClassicEditor && 'page' === getSiteOption( state, siteId, 'show_on_front' );

	return {
		isStaticHomePage,
	};
};

const trackDocsAction = isStaticHomePage =>
	composeAnalytics(
		recordTracksEvent( 'calypso_customer_home_support_docs_click', {
			is_static_home_page: isStaticHomePage,
		} ),
		bumpStat( 'calypso_customer_home', 'support_docs' )
	);

const trackContactAction = isStaticHomePage =>
	composeAnalytics(
		recordTracksEvent( 'calypso_customer_home_support_contact_click', {
			is_static_home_page: isStaticHomePage,
		} ),
		bumpStat( 'calypso_customer_home', 'support_contact' )
	);

const mapDispatchToProps = {
	trackContactAction,
	trackDocsAction,
};

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	const { isStaticHomePage } = stateProps;
	return {
		...ownProps,
		...stateProps,
		trackContactAction: () => dispatchProps.trackContactAction( isStaticHomePage ),
		trackDocsAction: () => dispatchProps.trackDocsAction( isStaticHomePage ),
	};
};

export default connect( mapStateToProps, mapDispatchToProps, mergeProps )( Support );
