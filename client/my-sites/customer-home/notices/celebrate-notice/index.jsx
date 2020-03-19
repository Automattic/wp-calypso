/**
 * External dependencies
 */
import { Card } from '@automattic/components';
import React from 'react';
import { connect } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CardHeading from 'components/card-heading';
import QueryActiveTheme from 'components/data/query-active-theme';
import QueryCanonicalTheme from 'components/data/query-canonical-theme';
import { getCurrentUser } from 'state/current-user/selectors';
import { getActiveTheme, getCanonicalTheme } from 'state/themes/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Image dependencies
 */
import fireworksIllustration from 'assets/images/illustrations/fireworks.svg';

const CelebrateNotice = ( {
	checklistMode,
	currentTheme,
	currentThemeId,
	displayChecklist,
	message,
	siteId,
	user,
} ) => {
	const translate = useTranslate();

	const getChecklistMessage = () => {
		switch ( checklistMode ) {
			case 'concierge':
				return translate(
					'We emailed %(email)s with instructions to schedule your Quick Start Session call with us. ' +
						'In the mean time, use this quick list of setup tasks to get your site ready to share.',
					{
						args: {
							email: user.email,
						},
					}
				);
			case 'theme':
				return translate(
					'Your theme %(themeName)s by %(themeAuthor)s is now active on your site. ' +
						'Next, use this quick list of setup tasks to get it ready to share.',
					{
						args: {
							themeName: currentTheme && currentTheme.name,
							themeAuthor: currentTheme && currentTheme.author,
						},
					}
				);
			case 'launched':
				return translate( 'Make sure you share it with everyone and show it off.' );
			case 'migrated':
				return translate( 'Next, make sure everything looks the way you expected.' );
			default:
				return translate(
					'Next, use this quick list of setup tasks to get your site ready to share.'
				);
		}
	};

	return (
		<Card className="celebrate-notice" highlight="info">
			{ siteId && 'theme' === checklistMode && <QueryActiveTheme siteId={ siteId } /> }
			{ currentThemeId && <QueryCanonicalTheme themeId={ currentThemeId } siteId={ siteId } /> }
			<img
				src={ fireworksIllustration }
				aria-hidden="true"
				className="celebrate-notice__fireworks"
				alt=""
			/>
			<div className="celebrate-notice__text">
				<CardHeading>{ message }</CardHeading>
				{ displayChecklist && (
					<p className="celebrate-notice__checklist-message">{ getChecklistMessage() }</p>
				) }
			</div>
		</Card>
	);
};

const mapStateToProps = ( state, { checklistMode } ) => {
	const siteId = getSelectedSiteId( state );
	let theme = {};
	if ( 'theme' === checklistMode ) {
		const currentThemeId = getActiveTheme( state, siteId );
		const currentTheme = currentThemeId && getCanonicalTheme( state, siteId, currentThemeId );
		theme = { currentTheme, currentThemeId };
	}
	return {
		siteId,
		user: getCurrentUser( state ),
		...theme,
	};
};

export default connect( mapStateToProps )( CelebrateNotice );
