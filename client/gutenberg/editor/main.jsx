import './style.scss';

const Main = ( { children } ) => (
	// eslint-disable-next-line wpcalypso/jsx-classname-namespace
	<div className="main main-column calypsoify is-iframe" role="main">
		{ children }
	</div>
);

export default Main;
