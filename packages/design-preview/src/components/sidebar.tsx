import { translate } from 'i18n-calypso';
import StyleVariationPreviews from './style-variation';
import type { StyleVariation } from '@automattic/design-picker/src/types';

interface SidebarProps {
	title?: string;
	description?: string;
	variations: StyleVariation[];
	selectedVariation?: StyleVariation;
	onSelectVariation: ( variation: StyleVariation ) => void;
	actionButtons: React.ReactNode;
}

const Sidebar: React.FC< SidebarProps > = ( {
	title,
	description,
	variations = [],
	selectedVariation,
	onSelectVariation,
	actionButtons,
} ) => {
	return (
		<div className="design-preview__sidebar">
			<div className="design-preview__sidebar-title">
				<h1>{ title }</h1>
			</div>

			{ description && (
				<div className="design-preview__sidebar-description">
					<p>{ description }</p>
				</div>
			) }

			{ variations.length > 0 && (
				<div className="design-preview__sidebar-variations">
					<h2> { translate( 'Style variations' ) }</h2>
					<div className="design-preview__sidebar-variations-grid">
						<StyleVariationPreviews
							variations={ variations }
							selectedVariation={ selectedVariation }
							onClick={ onSelectVariation }
						/>
					</div>
				</div>
			) }

			{ actionButtons && (
				<div className="design-preview__sidebar-action-buttons">{ actionButtons }</div>
			) }
		</div>
	);
};

export default Sidebar;
