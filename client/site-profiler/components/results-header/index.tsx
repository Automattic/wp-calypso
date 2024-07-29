import { Button, Gridicon } from '@automattic/components';
import { translate } from 'i18n-calypso';
import nonWpComSiteIcon from 'calypso/assets/images/site-profiler/non-wpcom-site.svg';
import wpComSiteIcon from 'calypso/assets/images/site-profiler/wpcom-site.svg';
import { PerformanceCategories } from 'calypso/data/site-profiler/types';

import './styles.scss';

type Props = {
	domain: string;
	performanceCategory: PerformanceCategories;
	isWpCom: boolean;
	isWordPress: boolean;
	onGetReport: () => void;
};

function getIcon( isWordPress?: boolean ) {
	if ( isWordPress ) {
		return <img src={ wpComSiteIcon } alt="" />;
	}
	return <img src={ nonWpComSiteIcon } alt="" />;
}

function getIsWpComSiteMessage( isWpCom?: boolean, isWordPress?: boolean ) {
	if ( isWpCom ) {
		return translate( 'This site is hosted on WordPress.com.' );
	}

	return isWordPress
		? translate( 'This site is built with WordPress.' )
		: translate( 'This site is not built with WordPress.' );
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

export const ResultsHeader = ( {
	domain,
	performanceCategory,
	isWpCom,
	isWordPress,
	onGetReport,
}: Props ) => {
	return (
		<div className="results-header--container">
			<div className="results-header--domain-container">
				<span className="domain-title">{ domain }</span>
				{ getIcon( isWordPress ) }
				<span className="domain-message">{ getIsWpComSiteMessage( isWpCom, isWordPress ) }</span>
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
