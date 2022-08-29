import { translate } from 'i18n-calypso';
import Variations from './variations';
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
						<Variations variations={ variations } />
					</div>
				</div>
			) }

			<div className="theme-preview-container__sidebar-support">
				<h2>{ translate( 'Support' ) }</h2>
				<p>
					{ translate(
						'{{contactLink}}Contact us{{/contactLink}} or visit the {{forumLink}}support forum{{/forumLink}}',
						{
							components: {
								contactLink: (
									<a
										href="https://wordpress.com/help/contact/"
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
								forumLink: (
									<a
										href="https://forums.wordpress.com/forum/themes"
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							},
						}
					) }
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
