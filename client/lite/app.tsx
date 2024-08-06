import { useTranslate } from 'i18n-calypso';
const App = () => {
	const translate = useTranslate();
	return (
		<div>
			<div>
				<h1>{ translate( 'Hello Calypso Lite!' ) }</h1>
			</div>
			<div>
				<a href="/about">{ translate( 'About' ) }</a>
			</div>
		</div>
	);
};

export default App;
