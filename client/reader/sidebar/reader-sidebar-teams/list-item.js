/**
 * External Dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import ReaderSidebarHelper from '../helper';
import { recordAction, recordGaEvent, recordTrack } from 'reader/stats';

const handleReaderSidebarTeamsListItemClicked = team => () => {
	recordAction( 'clicked_reader_sidebar_teams_list_item' );
	recordGaEvent( 'Clicked Reader Sidebar Teams List Item' );
	recordTrack( 'calypso_reader_sidebar_teams_list_item_clicked', {
		team: decodeURIComponent( team.slug ),
	} );
};

export const ReaderSidebarTeamsListItem = ( { path, team, translate } ) => {
	const teamUri = '/read/' + encodeURIComponent( team.slug );
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<li
			key={ team.slug }
			className={ ReaderSidebarHelper.itemLinkClass( teamUri, path, {
				'sidebar-streams__team': true,
			} ) }
		>
			<a
				href={ teamUri }
				onClick={ handleReaderSidebarTeamsListItemClicked( team ) }
				title={ translate( "View team '%(currentTeamName)s'", {
					args: {
						currentTeamName: team.title,
					},
				} ) }
			>
				<svg
					className={ 'gridicon gridicon-' + team.slug }
					width="24"
					height="24"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
				>
					<path d="M7.99 1.57C3.75 1.57 1 4.57 1 7.8v0.4c0 3.18 2.75 6.24 6.99 6.24 4.26 0 7.01-3.05 7.01-6.24V7.8C15 4.57 12.25 1.57 7.99 1.57zM12.74 8.13c0 2.32-1.69 4.42-4.74 4.42 -3.05 0-4.73-2.1-4.73-4.42V7.84c0-2.32 1.67-4.38 4.73-4.38 3.06 0 4.75 2.07 4.75 4.39V8.13z" />
					<path d="M9.47 5.73C9.07 5.47 8.52 5.59 8.26 6L6.21 9.17c-0.26 0.41-0.15 0.95 0.26 1.21 0.4 0.26 0.95 0.14 1.21-0.26l2.05-3.17C9.99 6.53 9.88 5.99 9.47 5.73z" />
				</svg>
				<span className="menu-link-text">
					{ team.title }
				</span>
			</a>
		</li>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

ReaderSidebarTeamsListItem.propTypes = {
	team: React.PropTypes.object.isRequired,
	path: React.PropTypes.string.isRequired,
};

export default localize( ReaderSidebarTeamsListItem );
