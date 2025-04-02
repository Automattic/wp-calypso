import { __experimentalVStack as VStack } from '@wordpress/components';
import Footer from '../footer';
import Header from '../header';
import './style.scss';

function Layout() {
	return (
		<VStack className="dashboard-layout" spacing={ 0 }>
			<Header />
			<main style={ { flexGrow: 1 } }></main>
			<Footer />
		</VStack>
	);
}

export default Layout;
