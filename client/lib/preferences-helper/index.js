import ReactDom from 'react-dom';
import { Provider } from 'react-redux';
import PreferenceList from './preference-list';

import './style.scss';

export default function injectPreferenceHelper( element, store ) {
	ReactDom.render(
		<Provider store={ store }>
			<PreferenceList />
		</Provider>,
		element
	);
}
