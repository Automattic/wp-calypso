/**
 * External dependencies
 */
import React from 'react';
import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import CardHeading from 'components/card-heading';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { SIDEBAR_SECTION_TOOLS } from 'my-sites/sidebar/constants';
import { expandMySitesSidebarSection as expandSection } from 'state/my-sites/sidebar/actions';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'state/analytics/actions';
import { getSelectedEditor } from 'state/selectors/get-selected-editor';
import { getSiteOption } from 'state/sites/selectors';

export const GrowEarn = ( { siteSlug, expandToolsAndTrack } ) => {
	const translate = useTranslate();

	return (
		<Card className="grow-earn">
			<CardHeading>{ translate( 'Grow & Earn' ) }</CardHeading>
			<h6 className="grow-earn__card-subheader customer-home__card-subheader">
				{ translate( 'Grow your audience and earn money' ) }
			</h6>
			<VerticalNav>
				<VerticalNavItem
					path={ `/marketing/connections/${ siteSlug }` }
					onClick={ () => expandToolsAndTrack( 'earn', 'share_site' ) }
				>
					{ translate( 'Share my site' ) }
				</VerticalNavItem>
				<VerticalNavItem
					path={ `/marketing/tools/${ siteSlug }` }
					onClick={ () => expandToolsAndTrack( 'earn', 'grow_audience' ) }
				>
					{ translate( 'Grow my audience' ) }
				</VerticalNavItem>
				<VerticalNavItem
					path={ `/earn/${ siteSlug }` }
					onClick={ () => expandToolsAndTrack( 'earn', 'money' ) }
				>
					{ translate( 'Earn money' ) }
				</VerticalNavItem>
			</VerticalNav>
		</Card>
	);
};

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const isClassicEditor = getSelectedEditor( state, siteId ) === 'classic';
		const pageOnFront = 'page' === getSiteOption( state, siteId, 'show_on_front' );
		return {
			siteSlug: getSelectedSiteSlug( state ),
			isStaticHomePage: ! isClassicEditor && pageOnFront,
		};
	},
	( dispatch ) => ( {
		trackAction: ( section, action, isStaticHomePage ) =>
			dispatch(
				composeAnalytics(
					recordTracksEvent( `calypso_customer_home_${ section }_${ action }_click`, {
						is_static_home_page: isStaticHomePage,
					} ),
					bumpStat( 'calypso_customer_home', `${ section }_${ action }` )
				)
			),
		expandToolsSection: () => dispatch( expandSection( SIDEBAR_SECTION_TOOLS ) ),
	} ),
	( stateProps, dispatchProps, ownProps ) => ( {
		...ownProps,
		...stateProps,
		expandToolsAndTrack: ( section, action ) => {
			dispatchProps.expandToolsSection();
			dispatchProps.trackAction( section, action, stateProps.isStaticHomePage );
		},
	} )
)( GrowEarn );
