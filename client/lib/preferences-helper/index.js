import { Provider } from 'react-redux';
import PreferenceList from './preference-list';

import './style.scss';

export default function injectPreferenceHelper( root, store ) {
	root.render(
		<Provider store={ store }>
			<PreferenceList />
		</Provider>
	);
}
