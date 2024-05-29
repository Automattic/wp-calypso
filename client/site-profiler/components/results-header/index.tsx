import { Button, Gridicon } from '@automattic/components';
import { translate } from 'i18n-calypso';
import nonWpComSiteIcon from 'calypso/assets/images/site-profiler/non-wpcom-site.svg';
import wpComSiteIcon from 'calypso/assets/images/site-profiler/wpcom-site.svg';
import { UrlData } from 'calypso/blocks/import/types';
import { PerformanceCategories } from 'calypso/data/site-profiler/types';

import './styles.scss';

type Props = {
	domain: string;
	performanceCategory: PerformanceCategories;
	urlData?: UrlData;
	onGetReport: () => void;
};

function getIcon( urlData?: UrlData ) {
	if ( urlData?.platform_data?.is_wpcom ) {
		return <img src={ wpComSiteIcon } alt={ translate( 'WordPress.com site' ) } />;
	}
	return <img src={ nonWpComSiteIcon } alt={ translate( 'Non WordPress.com site' ) } />;
}

function getIsWpComSiteMessage( urlData?: UrlData ) {
	if ( urlData?.platform_data?.is_wpcom ) {
		return translate( 'This site is hosted on WordPress.com' );
	}
	return translate( 'This site is not hosted on WordPress.com' );
}

function getTitleMessage( performanceCategory: PerformanceCategories ) {
	if ( performanceCategory === 'non-wpcom-low-performer' ) {
		return translate( 'Boost needed! Improve your site with us.' );
	}
	if ( performanceCategory === 'non-wpcom-high-performer' ) {
		return translate( 'Good, but you can make it even better.' );
	}
	if ( performanceCategory === 'wpcom-high-performer' ) {
		return translate( 'Your site is a top performer! Keep it up.' );
	}
	return translate( 'Room for growth! Let’s optimize your site.' );
}

export const ResultsHeader = ( { domain, performanceCategory, urlData, onGetReport }: Props ) => {
	return (
		<div className="results-header--container">
			<div className="results-header--domain-container">
				<span className="domain-title">{ domain }</span>
				{ getIcon( urlData ) }
				<span className="domain-message">{ getIsWpComSiteMessage( urlData ) }</span>
			</div>
			<h1>{ getTitleMessage( performanceCategory ) }</h1>
			<div className="results-header--button-container">
				<Button onClick={ onGetReport }>
					{ translate( 'Access full site report - It’s free' ) }
				</Button>
				<div className="link-component">
					<a href="/site-profiler">{ translate( 'Check another site' ) }</a>
					<Gridicon icon="chevron-right" size={ 18 } />
				</div>
			</div>
		</div>
	);
};
