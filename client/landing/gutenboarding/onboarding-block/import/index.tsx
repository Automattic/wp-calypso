import * as React from 'react';
import { useLocation } from 'react-router-dom';
import ReadyStep from './ready';
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
			{ query.get( 'step' ) === 'ready' && (
				<ReadyStep platform={ data.platform } website={ data.website } />
			) }
		</div>
	);
};

export default ImportSite;
