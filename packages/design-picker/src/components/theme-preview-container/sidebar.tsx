import { translate } from 'i18n-calypso';
import Variation from './variation';
import type { ThemeStyleVariation } from '../../types';

interface SidebarProps {
	title?: string;
	variations?: ThemeStyleVariation[];
}

const Sidebar: React.FC< SidebarProps > = ( { title, variations = [] } ) => {
	return (
		<div className="theme-preview-container__sidebar">
			<div className="theme-preview-container__sidebar-title">
				<h1>{ title }</h1>
			</div>

			{ variations.length > 0 && (
				<div className="theme-preview-container__sidebar-variations">
					<h2> { translate( 'Style variations' ) }</h2>
					{ variations.map( ( variation ) => (
						<Variation key={ variation.slug } variation={ variation } />
					) ) }
				</div>
			) }

			<div className="theme-preview-container__sidebar-support">
				<h2>{ translate( 'Support' ) }</h2>
				<p>
					<a href="https://wordpress.com/help/contact/" target="_blank" rel="noopener noreferrer">
						Contact us
					</a>{ ' ' }
					or visit the{ ' ' }
					<a
						href="https://en.forums.wordpress.com/forum/themes"
						target="_blank"
						rel="noopener noreferrer"
					>
						support forum
					</a>
				</p>
			</div>
		</div>
	);
};

export default Sidebar;
