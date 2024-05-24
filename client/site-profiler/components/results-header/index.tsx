import { Button, Gridicon } from '@automattic/components';
import { translate } from 'i18n-calypso';
import './styles.scss';
import { isScoreGood } from 'calypso/data/site-profiler/metrics-dictionaries';
import { Scores } from 'calypso/data/site-profiler/types';

type Props = {
	domain: string;
	overallScore: Scores;
	onGetReport: () => void;
};

function getIcon() {
	// TODO: Implement the functionality to get the correct Icon
	// https://github.com/Automattic/dotcom-forge/issues/7281
	return <Gridicon icon="time" size={ 24 } />;
}

function getDomainMessage() {
	// TODO: Implement the functionality to get the correct Domain message
	// https://github.com/Automattic/dotcom-forge/issues/7281
	return translate( 'This site is not hosted on WordPress.com' );
}

function getTitleMessage( overallScore: Scores ) {
	if ( ! isScoreGood( overallScore ) ) {
		return translate( 'Your site needs a boost. Let’s improve it.' );
	}
	return translate( 'Your site is a top performer! Keep it up.' );
}

export const ResultsHeader = ( { domain, overallScore, onGetReport }: Props ) => {
	return (
		<div className="results-header--container">
			<div className="results-header--domain-container">
				<span className="domain-title">{ domain }</span>
				{ getIcon() }
				<span className="domain-message">{ getDomainMessage() }</span>
			</div>
			<h1>{ getTitleMessage( overallScore ) }</h1>
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
