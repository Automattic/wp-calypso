import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import PreferenceList from './preference-list';

import './style.scss';

export default function injectPreferenceHelper( element, store ) {
	createRoot( element ).render(
		<Provider store={ store }>
			<PreferenceList />
		</Provider>
	);
}
