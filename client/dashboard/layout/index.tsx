import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Domains from '../domains';
import Header from '../header';
import Profile from '../profile';
import Site from '../site';
import SiteBackups from '../site-backups';
import Sites from '../sites';
import './style.scss';

// Create a client
const queryClient = new QueryClient();

function Layout() {
	return (
		<QueryClientProvider client={ queryClient }>
			<BrowserRouter basename="/v2">
				<div className="dashboard__layout">
					<Header />
					<main className="dashboard__content">
						<Routes>
							<Route path="/sites" element={ <Sites /> } />
							<Route path="/sites/:id" element={ <Site /> } />
							<Route path="/sites/:id/backups" element={ <SiteBackups /> } />
							<Route path="/domains" element={ <Domains /> } />
							<Route path="/account/profile" element={ <Profile /> } />
							<Route path="/" element={ <Navigate to="/sites" replace /> } />
						</Routes>
					</main>
				</div>
			</BrowserRouter>
		</QueryClientProvider>
	);
}

export default Layout;
