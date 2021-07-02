/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Gridicon from 'calypso/components/gridicon';
import { preventWidows } from 'calypso/lib/formatting';

/**
 * Style dependencies
 */
import './style.scss';

const ScanMultisiteNotice: FunctionComponent = () => {
	const multiSiteInfoLink = `https://jetpack.com/support/scan/#does-jetpack-scan-support-multisite`;
	return (
		<div className="scan-multisite-notice">
			<div className="scan-multisite-notice__title">
				{ preventWidows( translate( 'This site is a WordPress Multisite installation.' ) ) }
			</div>
			<p className="scan-multisite-notice__info">
				{ preventWidows(
					translate(
						'Jetpack Scan for Multisite installations is not fully supported. ' +
							'For more information {{ExternalLink}}visit our documentation page {{externalIcon/}}{{/ExternalLink}}.',
						{
							components: {
								ExternalLink: (
									<a href={ multiSiteInfoLink } target="_blank" rel="noopener noreferrer" />
								),
								externalIcon: <Gridicon icon="external" size={ 18 } />,
							},
						}
					)
				) }
			</p>
		</div>
	);
};

export default ScanMultisiteNotice;
