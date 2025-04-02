import { __experimentalVStack as VStack } from '@wordpress/components';
import Header from '../header';
import './style.scss';

function Layout() {
	return (
		<VStack className="dashboard-layout" spacing={ 0 }>
			<Header />
			<main style={ { flexGrow: 1 } }></main>
		</VStack>
	);
}

export default Layout;
