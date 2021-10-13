import * as React from 'react';
import { useLocation } from 'react-router-dom';
import CaptureStep from './capture';
import ListStep from './list';
import { ReadyStep, ReadyNotStep, ReadyNoUrlStep } from './ready';
import ScanningStep from './scanning';
import './style.scss';

function useQuery() {
	return new URLSearchParams( useLocation().search );
}

const ImportSite: React.FunctionComponent = () => {
	const query = useQuery();

	// Temp mock
	const data = {
		website: 'https://openweb.com/',
		platform: 'Wix',
	};

	return (
		<div className="gutenboarding-page import">
			{ ( query.get( 'step' ) === 'list' || ! query.get( 'step' ) ) && <ListStep /> }
			{ query.get( 'step' ) === 'capture' && <CaptureStep /> }
			{ query.get( 'step' ) === 'scanning' && <ScanningStep /> }
			{ query.get( 'step' ) === 'ready' && (
				<ReadyStep platform={ data.platform } website={ data.website } />
			) }
			{ query.get( 'step' ) === 'ready-no-url' && (
				<ReadyNoUrlStep platform={ data.platform } website={ data.website } />
			) }
			{ query.get( 'step' ) === 'ready-not' && (
				<ReadyNotStep platform={ data.platform } website={ data.website } />
			) }
		</div>
	);
};

export default ImportSite;
