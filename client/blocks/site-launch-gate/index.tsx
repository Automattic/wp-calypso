/**
 * External dependencies
 */
import React, { FunctionComponent, SyntheticEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { translate } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { localizeUrl } from 'lib/i18n-utils';
import getSectionName from 'state/ui/selectors/get-section-name';
import getSelectedSiteId from 'state/ui/selectors/get-selected-site-id';
import isUnlaunchedSite from 'state/selectors/is-unlaunched-site';
import { launchSiteOrRedirectToLaunchSignupFlow } from 'state/sites/launch/actions';
import Card from 'components/card';
import Button from 'components/button';
import InlineSupportLink from 'components/inline-support-link';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	className?: string;
}

const SiteLaunchGate: FunctionComponent< Props > = ( { children, className } ) => {
	const dispatch = useDispatch();
	const section = useSelector( getSectionName );
	const siteId = useSelector( getSelectedSiteId );
	const isUnlaunched = useSelector( state => isUnlaunchedSite( state, siteId ) );

	if ( ! isUnlaunched ) {
		return <>{ children }</>;
	}

	const toContinueText =
		( section === 'themes' &&
			translate( 'To continue installing the theme, you must launch your site.' ) ) ||
		( section === 'plugins' &&
			translate( 'To continue installing the plugin, you must launch your site.' ) ) ||
		translate( 'To continue, you must launch your site.' );

	return (
		<Card className={ classNames( 'site-launch-gate', className ) }>
			{ toContinueText }
			<div className="site-launch-gate__actions">
				<Button
					primary
					onClick={ ( e: SyntheticEvent ) => {
						e.preventDefault();
						dispatch( launchSiteOrRedirectToLaunchSignupFlow( siteId ) );
					} }
				>
					{ translate( 'Launch site' ) }
				</Button>
				<InlineSupportLink
					supportPostId={ 1507 }
					supportLink={ localizeUrl(
						'https://en.support.wordpress.com/settings/privacy-settings/'
					) }
				/>
			</div>
		</Card>
	);
};

export default SiteLaunchGate;
