import { __experimentalVStack as VStack } from '@wordpress/components';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RequireAuth from '../auth/require-auth';
import Domains from '../domains';
import Header from '../header';
import Sites from '../sites';
import './style.scss';

function Layout() {
	return (
		<BrowserRouter basename="/v2">
			<RequireAuth>
				<VStack className="dashboard-layout" spacing={ 0 }>
					<Header />
					<main style={ { flexGrow: 1, padding: '20px' } }>
						<Routes>
							<Route path="/sites" element={ <Sites /> } />
							<Route path="/domains" element={ <Domains /> } />
							<Route path="/" element={ <Navigate to="/sites" replace /> } />
						</Routes>
					</main>
				</VStack>
			</RequireAuth>
		</BrowserRouter>
	);
}

export default Layout;
