/**
 * External dependencies
 */
import React, { ReactElement, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import ThankYou, { ThankYouCtaType } from './thank-you';
import versionCompare from 'calypso/lib/version-compare';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const ThankYouCta: ThankYouCtaType = ( {
	dismissUrl,
	jetpackVersion,
	recordThankYouClick,
	siteAdminUrl,
} ) => {
	const translate = useTranslate();
	return (
		<>
			<Button
				primary
				href={
					jetpackVersion && versionCompare( jetpackVersion, '8.4', '<' )
						? siteAdminUrl + 'plugins.php'
						: siteAdminUrl + 'customize.php?autofocus[section]=jetpack_search'
				}
				onClick={ () => recordThankYouClick( 'search', 'customizer' ) }
			>
				{ jetpackVersion && versionCompare( jetpackVersion, '8.4', '<' )
					? translate( 'Update Jetpack' )
					: translate( 'Try Search and customize it now' ) }
			</Button>
			<Button href={ dismissUrl }>{ translate( 'Close' ) }</Button>
		</>
	);
};

const SearchProductThankYou = (): ReactElement => {
	const translate = useTranslate();
	const selectedSite = useSelector( getSelectedSite );
	const jetpackVersion = useMemo( () => selectedSite?.options?.jetpack_version || 0, [
		selectedSite,
	] );
	return (
		<ThankYou
			illustration="/calypso/images/illustrations/thankYou.svg"
			ThankYouCtaComponent={ ThankYouCta }
			title={ translate( 'Welcome to Jetpack Search!' ) }
		>
			<>
				<p>{ translate( 'We are currently indexing your site.' ) }</p>
				<p>
					{ jetpackVersion && versionCompare( jetpackVersion, '8.4', '<' )
						? translate(
								"In the meantime you'll need to update Jetpack to version 8.4 or higher in order " +
									"to get the most out of Jetpack Search. Once you've updated Jetpack, " +
									"we'll configure Search for you. You can try search and customize it to your liking."
						  )
						: translate(
								'In the meantime, we have configured Jetpack Search on your site — ' +
									'you should try customizing it in your traditional WordPress dashboard.'
						  ) }
				</p>
			</>
		</ThankYou>
	);
};

export default SearchProductThankYou;
