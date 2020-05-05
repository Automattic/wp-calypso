/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DismissibleCard from 'blocks/dismissible-card';
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
	dismissalPreferenceName,
	displayChecklist,
	message,
	siteId,
	user,
} ) => {
	const translate = useTranslate();

	const getSecondaryText = () => {
		if ( ! displayChecklist ) {
			return translate(
				'Next, use these quick links to continue maintaining and growing your site.'
			);
		}

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
				return translate( 'Next, finish the following setup tasks before you share your site.' );
		}
	};

	return (
		<DismissibleCard
			className="celebrate-notice"
			highlight="info"
			preferenceName={ `${ dismissalPreferenceName }-${ siteId }` } // Makes cards dismissable per site.
		>
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
				<p className="celebrate-notice__secondary-text">{ getSecondaryText() }</p>
			</div>
		</DismissibleCard>
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
