import { WordPressLogo, WordPressWordmark } from '../index';

function WordPressLogoExample() {
	return (
		<>
			<h3>WordPress Logo</h3>
			<div>
				<WordPressLogo />
			</div>
			<br />
			<h3>WordPress Watermark</h3>
			<div>
				<WordPressWordmark />
			</div>
		</>
	);
}

WordPressLogoExample.displayName = 'WordPressLogo';

export default WordPressLogoExample;
