import { translate } from 'i18n-calypso';
import Variation from './variation';
import type { ThemeFeature, ThemeStyleVariation } from '../../types';

interface SidebarProps {
	title?: string;
	description?: string;
	variations?: ThemeStyleVariation[];
	features?: ThemeFeature[];
}

const Sidebar: React.FC< SidebarProps > = ( {
	title,
	description,
	variations = [],
	features = [],
} ) => {
	return (
		<div className="theme-preview-container__sidebar">
			<div className="theme-preview-container__sidebar-title">
				<h1>{ title }</h1>
			</div>

			{ description && (
				<div className="theme-preview-container__sidebar-description">
					<p>{ description }</p>
				</div>
			) }

			{ variations.length > 0 && (
				<div className="theme-preview-container__sidebar-variations">
					<h2> { translate( 'Style variations' ) }</h2>
					<div className="theme-preview-container__sidebar-variations-grid">
						{ variations.map( ( variation ) => (
							<div
								key={ variation.slug }
								className="theme-preview-container__sidebar-variation"
								tabIndex={ 0 }
								role="button"
							>
								<Variation variation={ variation } />
							</div>
						) ) }
					</div>
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

			{ features.length > 0 && (
				<div className="theme-preview-container__sidebar-features">
					<h2>{ translate( 'Features' ) }</h2>
					<ul className="theme-preview-container__sidebar-features-list">
						{ features.map( ( feature ) => (
							<div key={ feature.slug }>{ feature.name }</div>
						) ) }
					</ul>
				</div>
			) }
		</div>
	);
};

export default Sidebar;
