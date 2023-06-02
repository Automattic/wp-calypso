import { __ } from '@wordpress/i18n';
import { DefaultAvatar } from './icons/default-avatar';
import { SidebarProps } from './types';

export const Sidebar: React.FC< SidebarProps > = ( { profileImage, showThreadConnector } ) => {
	return (
		<div className="twitter-preview__sidebar">
			<div className="twitter-preview__profile-image">
				{ profileImage ? (
					<img alt={ __( 'Twitter profile image', 'social-previews' ) } src={ profileImage } />
				) : (
					<DefaultAvatar />
				) }
			</div>
			{ showThreadConnector && <div className="twitter-preview__connector" /> }
		</div>
	);
};
