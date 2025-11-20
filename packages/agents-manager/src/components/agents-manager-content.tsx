import { Route, Routes, useNavigate } from 'react-router-dom';

/**
 * Demo route components to demonstrate persistent navigation
 */
const HomePage = () => {
	const navigate = useNavigate();

	return (
		<div>
			<h3>Agents Manager Home</h3>
			<br />
			<p>This is the home page.</p>
			<nav style={ { display: 'flex', gap: '1rem', marginTop: '1rem' } }>
				<button onClick={ () => navigate( '/page1' ) }>Go to Page 1</button>
				<button onClick={ () => navigate( '/page2' ) }>Go to Page 2</button>
				<button onClick={ () => navigate( '/page3' ) }>Go to Page 3</button>
			</nav>
		</div>
	);
};

const Page1 = () => {
	const navigate = useNavigate();

	return (
		<div>
			<h3>Page 1</h3>
			<br />
			<nav style={ { display: 'flex', gap: '1rem', marginTop: '1rem' } }>
				<button onClick={ () => navigate( '/page2' ) }>Go to Page 2</button>
				<button onClick={ () => navigate( '/page3' ) }>Go to Page 3</button>
			</nav>
		</div>
	);
};

const Page2 = () => {
	const navigate = useNavigate();

	return (
		<div>
			<h3>Page 2</h3>
			<br />
			<nav style={ { display: 'flex', gap: '1rem', marginTop: '1rem' } }>
				<button onClick={ () => navigate( '/page1' ) }>Go to Page 1</button>
				<button onClick={ () => navigate( '/page3' ) }>Go to Page 3</button>
			</nav>
		</div>
	);
};

const Page3 = () => {
	const navigate = useNavigate();

	return (
		<div>
			<h3>Page 3</h3>
			<br />
			<nav style={ { display: 'flex', gap: '1rem', marginTop: '1rem' } }>
				<button onClick={ () => navigate( '/page1' ) }>Go to Page 1</button>
				<button onClick={ () => navigate( '/page2' ) }>Go to Page 2</button>
			</nav>
		</div>
	);
};

/**
 * Content component that handles routing
 */
export const AgentsManagerContent = () => {
	return (
		<Routes>
			<Route path="/" element={ <HomePage /> } />
			<Route path="/page1" element={ <Page1 /> } />
			<Route path="/page2" element={ <Page2 /> } />
			<Route path="/page3" element={ <Page3 /> } />
		</Routes>
	);
};
