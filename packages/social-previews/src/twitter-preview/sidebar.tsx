import { __ } from '@wordpress/i18n';
import { SidebarProps } from './types';

export const Sidebar: React.FC< SidebarProps > = ( { profileImage, isLast } ) => {
	return (
		<div className="twitter-preview__sidebar">
			<div className="twitter-preview__profile-image">
				<img alt={ __( 'Twitter profile image', 'social-previews' ) } src={ profileImage } />
			</div>
			{ ! isLast && <div className="twitter-preview__connector" /> }
		</div>
	);
};
