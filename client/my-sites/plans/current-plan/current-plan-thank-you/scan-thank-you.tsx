/**
 * External dependencies
 */
import React, { useCallback, ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import ThankYou, { ThankYouCtaType } from './thank-you';
import { settingsPath } from 'calypso/lib/jetpack/paths';
import getSelectedSiteSlug from 'calypso/state/ui/selectors/get-selected-site-slug';

const ThankYouCta: ThankYouCtaType = ( {
	dismissUrl,
	recordThankYouClick,
	startChecklistTour,
} ) => {
	const translate = useTranslate();
	const selectedSiteSlug = useSelector( getSelectedSiteSlug ) as string;
	const onCheckListClick = useCallback( () => {
		recordThankYouClick( 'scan', 'checklist' );
		startChecklistTour();
	}, [ recordThankYouClick, startChecklistTour ] );
	return (
		<>
			<Button
				href={ `${ settingsPath( selectedSiteSlug ) }#credentials` }
				onClick={ () => recordThankYouClick( 'scan', 'server-credentials' ) }
				primary
			>
				{ translate( 'Add server credentials now' ) }
			</Button>
			<Button href={ dismissUrl } onClick={ onCheckListClick }>
				{ translate( 'See checklist' ) }
			</Button>
		</>
	);
};

const ScanProductThankYou = (): ReactElement => {
	const translate = useTranslate();
	return (
		<ThankYou
			illustration="/calypso/images/illustrations/security.svg"
			title={ translate( 'Welcome to Jetpack Scan!' ) }
			ThankYouCtaComponent={ ThankYouCta }
		>
			<>
				<p>{ translate( 'We just finished setting up automated malware scanning for you.' ) }</p>
				<p>
					{ translate(
						'Please add your server information to set up automated and one-click fixes. '
					) }
				</p>
				<p>{ translate( "There's also a checklist to help you get the most out of Jetpack." ) }</p>
			</>
		</ThankYou>
	);
};

export default ScanProductThankYou;
