import Theme from './theme';

export default function ThemesList( props ) {
	const { themes } = props;
	console.log( themes, Theme );
	return (
		<div id="themes-list" className="theme-browser">
			{ themes.map( ( theme ) => (
				<Theme key={ theme.id } theme={ theme } />
			) ) }
		</div>
	);
}
