import { Button, Gridicon } from '@automattic/components';
import { translate } from 'i18n-calypso';
import { type BasicMetrics } from 'calypso/data/site-profiler/types';
import './styles.scss';

type Props = {
	domain: string;
	basicMetrics: BasicMetrics;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getIcon( basicMetrics: BasicMetrics ) {
	return <Gridicon icon="time" size={ 24 } />;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getDomainMessage( basicMetrics: BasicMetrics ) {
	return translate( 'This site is not hosted on WordPress.com' );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getTitleMessage( basicMetrics: BasicMetrics ) {
	return translate( 'Your site needs a boost. Let’s improve it.' );
}

export const ResultsHeader = ( { domain, basicMetrics }: Props ) => {
	return (
		<div className="results-header--container">
			<div className="results-header--domain-container">
				<span>{ domain }</span>
				{ getIcon( basicMetrics ) }
				{ getDomainMessage( basicMetrics ) }
			</div>
			<h1>{ getTitleMessage( basicMetrics ) }</h1>
			<div className="results-header--button-container">
				<Button>{ translate( 'Get a report' ) }</Button>
				<a href="/site-profiler">{ translate( 'Check another site' ) }</a>
			</div>
		</div>
	);
};
