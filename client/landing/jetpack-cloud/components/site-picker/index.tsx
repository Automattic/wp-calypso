/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import CardHeading from 'components/card-heading';
import SiteSelector from 'components/site-selector';

/**
 * Style dependencies
 */
import './style.scss';

interface ExternalProps {
	siteBasePath: string;
}

type Props = ExternalProps;

const filterSites = ( site: any ) => {
	return site ? site.jetpack && ! site.options.is_automated_transfer : site;
};

const SitesPicker = ( { siteBasePath }: Props ) => {
	const translate = useTranslate();

	const getHeaderText = () => {
		let path: string = siteBasePath.split( '?' )[ 0 ].split( '/' )[ 1 ];
		if ( typeof path !== 'undefined' ) {
			path = path.toLowerCase();
		}

		switch ( path ) {
			case 'backups':
				return translate( 'Select a site to open {{strong}}Backups{{/strong}}', {
					components: {
						strong: <strong />,
					},
				} );
			case 'scan':
				return translate( 'Select a site to open {{strong}}Scans{{/strong}}', {
					components: {
						strong: <strong />,
					},
				} );
			default:
				return translate( 'Select a site to open' );
		}
	};

	return (
		<Card className="site-picker">
			<CardHeading tagName="h2" size={ 18 }>
				{ getHeaderText() }
			</CardHeading>
			<SiteSelector filter={ filterSites } siteBasePath={ siteBasePath } />
		</Card>
	);
};

export default SitesPicker;
