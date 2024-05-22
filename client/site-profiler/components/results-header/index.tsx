import { Button, Gridicon } from '@automattic/components';
import { translate } from 'i18n-calypso';
import { type BasicMetrics } from 'calypso/data/site-profiler/types';
import './styles.scss';

type Props = {
	domain: string;
	basicMetrics: BasicMetrics;
	onGetReport: () => void;
};

function getIcon() {
	// TODO: Implement the functionality to get the correct Icon
	// https://github.com/Automattic/dotcom-forge/issues/7281
	return <Gridicon icon="time" size={ 24 } />;
}

function getDomainMessage() {
	// TODO: Implement the functionality to get the correct Icon
	// https://github.com/Automattic/dotcom-forge/issues/7281
	return translate( 'This site is not hosted on WordPress.com' );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getTitleMessage( basicMetrics: BasicMetrics ) {
	// TODO: Implement the functionality to get the correct title
	// https://github.com/Automattic/dotcom-forge/issues/7298
	return translate( 'Your site needs a boost. Let’s improve it.' );
}

export const ResultsHeader = ( { domain, basicMetrics, onGetReport }: Props ) => {
	return (
		<div className="results-header--container">
			<div className="results-header--domain-container">
				<span className="domain-title">{ domain }</span>
				{ getIcon() }
				<span className="domain-message">{ getDomainMessage() }</span>
			</div>
			<h1>{ getTitleMessage( basicMetrics ) }</h1>
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
