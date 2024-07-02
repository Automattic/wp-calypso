import { __ } from '@wordpress/i18n';
import { DefaultAvatar } from './icons/default-avatar';
import { SidebarProps } from './types';

export const Sidebar: React.FC< SidebarProps > = ( { profileImage, showThreadConnector } ) => {
	return (
		<div className="threads-preview__sidebar">
			<div className="threads-preview__profile-image">
				{ profileImage ? (
					<img alt={ __( 'Threads profile image', 'social-previews' ) } src={ profileImage } />
				) : (
					<DefaultAvatar />
				) }
			</div>
			{ showThreadConnector && <div className="threads-preview__connector" /> }
		</div>
	);
};
