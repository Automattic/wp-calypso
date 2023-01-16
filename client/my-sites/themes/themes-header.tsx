import { translate } from 'i18n-calypso';

import './themes-header.scss';

interface Props {
	description: string;
	children: any;
}

const ThemesHeader = ( { description, children }: Props ) => {
	return (
		<div className="themes__header">
			<div className="themes__page-heading">
				<h1>{ translate( 'Themes' ) }</h1>
				<p className="page-sub-header">{ description }</p>
			</div>
			{ children }
		</div>
	);
};

export default ThemesHeader;
