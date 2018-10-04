/** @format */
/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
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
					viewBox="0 0 24 24"
				>
					<path
						d="M12 21.5c-6.1 0-10-4.4-10-9V12c0-4.6 4-9 10-9 6.1 0 10.1 4.3 10.1 9v.6c0 4.5-3.9 8.9-10.1
						8.9zm6.9-9.5c0-3.3-2.4-6.3-6.8-6.3s-6.8 3-6.8 6.3v.4c0 3.3 2.4 6.4 6.8 6.4s6.8-3 6.8-6.4V12z"
					/>
					<path d="M14.1 8.5c.6.4.7 1.2.4 1.7l-2.9 4.6c-.4.6-1.2.8-1.7.4-.7-.4-.9-1.2-.5-1.8l2.9-4.6c.4-.5 1.2-.7 1.8-.3z" />
				</svg>
				<span className="menu-link-text">{ team.title }</span>
			</a>
		</li>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

ReaderSidebarTeamsListItem.propTypes = {
	team: PropTypes.object.isRequired,
	path: PropTypes.string.isRequired,
};

export default localize( ReaderSidebarTeamsListItem );
