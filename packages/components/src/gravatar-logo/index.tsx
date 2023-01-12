import { Path, SVG } from '@wordpress/components';
import classNames from 'classnames';

type Props = {
	className?: string;
	size?: number;
};

export function GravatarLogo( { className, size = 32 }: Props ) {
	const classes = classNames( 'gravatar-logo', className );

	return (
		<SVG className={ classes } height={ size } viewBox="0 0 146 27">
			<title>Gravatar</title>
			<Path
				fill="#4678eb"
				d="M10.8 2.699v9.45a2.699 2.699 0 005.398 0V5.862a8.101 8.101 0 11-8.423 1.913 2.702 2.702 0 00-3.821-3.821A13.5 13.5 0 1013.499 0 2.699 2.699 0 0010.8 2.699z"
			></Path>
			<Path
				fill="#101517"
				d="M46.109 24.138c2.246 0 4.445-.537 6.595-1.612.326-.154.59-.39.792-.706.202-.317.302-.677.302-1.08v-6.538c0-.384-.134-.71-.403-.979a1.333 1.333 0 00-.979-.403h-5.674c-.326 0-.604.115-.835.346-.23.23-.345.508-.345.835 0 .326.115.605.345.835.23.23.509.346.835.346h4.752v5.212a10.393 10.393 0 01-5.04 1.268c-1.612 0-3.01-.341-4.19-1.023a6.89 6.89 0 01-2.707-2.793c-.624-1.181-.936-2.52-.936-4.018 0-1.632.331-3.038.993-4.22a6.635 6.635 0 012.75-2.692c1.172-.614 2.487-.922 3.946-.922 1.056 0 2.036.135 2.938.404.902.268 1.805.672 2.707 1.21.192.095.394.143.605.143.365 0 .658-.115.878-.345.221-.23.332-.51.332-.836 0-.23-.058-.441-.173-.633a1.013 1.013 0 00-.403-.403 14.434 14.434 0 00-3.24-1.527c-1.124-.365-2.434-.547-3.932-.547-1.862 0-3.556.432-5.083 1.296-1.526.864-2.731 2.083-3.614 3.658C36.442 9.988 36 11.793 36 13.828c0 1.997.422 3.778 1.267 5.342a9.095 9.095 0 003.571 3.658c1.536.874 3.293 1.31 5.27 1.31zm12.33-.144c.365 0 .677-.124.936-.374s.389-.557.389-.922v-8.755a5.837 5.837 0 011.93-1.857 4.912 4.912 0 012.534-.677h.144c.384 0 .7-.115.95-.346.25-.23.374-.528.374-.893 0-.364-.12-.672-.36-.921a1.205 1.205 0 00-.907-.375h-.144c-1.67 0-3.177.903-4.521 2.708v-1.239c0-.365-.13-.677-.39-.936a1.276 1.276 0 00-.935-.389c-.365 0-.672.13-.922.39-.25.258-.374.57-.374.935v12.355c0 .365.125.672.374.922.25.25.557.374.922.374zm12.578.144c2.189 0 3.994-.73 5.415-2.188v.748c0 .365.124.672.374.922s.557.374.922.374c.364 0 .676-.124.936-.374.259-.25.388-.557.388-.922v-8.15c0-.998-.216-1.925-.648-2.78-.432-.854-1.104-1.55-2.016-2.087-.912-.538-2.03-.807-3.355-.807-1.69 0-3.35.346-4.982 1.037-.5.211-.749.576-.749 1.095 0 .307.106.566.317.777.211.211.46.317.749.317.096 0 .22-.02.374-.058.691-.23 1.32-.403 1.886-.518a9.818 9.818 0 011.944-.173c1.325 0 2.3.279 2.924.835.624.557.936 1.47.936 2.736v.23h-3.485c-2.17 0-3.816.423-4.94 1.268-1.123.845-1.684 1.978-1.684 3.398 0 .864.211 1.628.633 2.29a4.088 4.088 0 001.714 1.512c.72.346 1.502.518 2.347.518zm.98-2.304c-1.095 0-1.877-.21-2.348-.633-.47-.423-.705-.98-.705-1.67 0-1.517 1.45-2.276 4.348-2.276h3.14v2.42a6.805 6.805 0 01-1.988 1.54 5.207 5.207 0 01-2.448.62zm15.803 2.16c.346 0 .663-.1.95-.302.289-.202.5-.456.634-.763l5.012-11.981a1.61 1.61 0 00.144-.605c0-.365-.125-.677-.375-.936a1.23 1.23 0 00-.921-.389c-.25 0-.485.072-.706.216-.22.144-.38.322-.475.533l-4.407 11.175L83.25 9.767a1.257 1.257 0 00-.475-.533 1.27 1.27 0 00-.706-.216c-.365 0-.672.13-.921.39-.25.258-.375.57-.375.935 0 .173.048.375.144.605l5.011 11.98c.135.308.346.562.634.764.288.202.605.302.95.302h.288zm12.435.144c2.189 0 3.993-.73 5.414-2.188v.748c0 .365.125.672.375.922s.556.374.921.374.677-.124.936-.374c.26-.25.389-.557.389-.922v-8.15c0-.998-.216-1.925-.648-2.78-.432-.854-1.104-1.55-2.016-2.087-.912-.538-2.03-.807-3.355-.807-1.69 0-3.35.346-4.983 1.037-.499.211-.748.576-.748 1.095 0 .307.105.566.316.777.212.211.461.317.75.317.095 0 .22-.02.374-.058.69-.23 1.32-.403 1.886-.518a9.818 9.818 0 011.944-.173c1.325 0 2.3.279 2.923.835.624.557.936 1.47.936 2.736v.23h-3.485c-2.17 0-3.816.423-4.939 1.268-1.123.845-1.685 1.978-1.685 3.398 0 .864.212 1.628.634 2.29a4.088 4.088 0 001.714 1.512c.72.346 1.502.518 2.347.518zm.979-2.304c-1.094 0-1.877-.21-2.347-.633-.47-.423-.706-.98-.706-1.67 0-1.517 1.45-2.276 4.349-2.276h3.14v2.42a6.805 6.805 0 01-1.988 1.54 5.207 5.207 0 01-2.448.62zm15.286 2.304c.844 0 1.641-.172 2.39-.518.442-.23.662-.566.662-1.008a.977.977 0 00-.316-.734 1.015 1.015 0 00-.72-.303c-.135 0-.245.01-.332.029a9.58 9.58 0 00-.244.058 3.991 3.991 0 01-1.152.172c-.538 0-.984-.1-1.34-.302-.355-.202-.532-.677-.532-1.426V11.41h3.254c.326 0 .595-.11.806-.331.212-.221.317-.485.317-.792 0-.327-.105-.596-.317-.807a1.092 1.092 0 00-.806-.317h-3.254V6.858a.578.578 0 00-.159-.403.507.507 0 00-.389-.173c-.153 0-.316.087-.49.26l-3.916 3.83c-.173.134-.26.298-.26.49 0 .153.054.283.16.388a.529.529 0 00.388.159h2.045v8.928c0 2.534 1.401 3.801 4.205 3.801zm8.776 0c2.19 0 3.994-.73 5.415-2.188v.748c0 .365.125.672.374.922.25.25.557.374.922.374s.677-.124.936-.374.389-.557.389-.922v-8.15c0-.998-.216-1.925-.648-2.78-.432-.854-1.104-1.55-2.016-2.087-.912-.538-2.03-.807-3.356-.807-1.69 0-3.35.346-4.982 1.037-.5.211-.749.576-.749 1.095 0 .307.106.566.317.777.211.211.46.317.749.317.096 0 .22-.02.374-.058.691-.23 1.32-.403 1.887-.518a9.818 9.818 0 011.944-.173c1.324 0 2.299.279 2.923.835.624.557.936 1.47.936 2.736v.23h-3.485c-2.17 0-3.816.423-4.94 1.268-1.122.845-1.684 1.978-1.684 3.398 0 .864.211 1.628.634 2.29a4.088 4.088 0 001.713 1.512c.72.346 1.503.518 2.347.518zm.98-2.304c-1.095 0-1.877-.21-2.348-.633-.47-.423-.705-.98-.705-1.67 0-1.517 1.45-2.276 4.349-2.276h3.139v2.42a6.805 6.805 0 01-1.987 1.54 5.207 5.207 0 01-2.448.62zm11.858 2.16c.365 0 .677-.124.936-.374.26-.25.389-.557.389-.922v-8.755a5.837 5.837 0 011.93-1.857 4.912 4.912 0 012.534-.677h.144c.384 0 .7-.115.95-.346.25-.23.375-.528.375-.893 0-.364-.12-.672-.36-.921a1.205 1.205 0 00-.908-.375h-.144c-1.67 0-3.177.903-4.521 2.708v-1.239c0-.365-.13-.677-.389-.936a1.276 1.276 0 00-.936-.389c-.365 0-.672.13-.922.39-.25.258-.374.57-.374.935v12.355c0 .365.125.672.374.922.25.25.557.374.922.374z"
			></Path>
		</SVG>
	);
}
