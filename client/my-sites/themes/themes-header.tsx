import './themes-header.scss';

interface Props {
	title: string;
	description: string;
	children: any;
}

const ThemesHeader = ( { title, description, children }: Props ) => {
	return (
		<div className="themes__header">
			<div className="themes__page-heading">
				<h1>{ title }</h1>
				<p className="page-sub-header">{ description }</p>
			</div>
			{ children }
		</div>
	);
};

export default ThemesHeader;
