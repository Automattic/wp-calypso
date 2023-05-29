import { __ } from '@wordpress/i18n';
import { DEFAULT_PROPS } from './constants';
import { SidebarProps } from './types';

export const Sidebar: React.FC< SidebarProps > = ( { profileImage, showThreadConnector } ) => {
	return (
		<div className="twitter-preview__sidebar">
			<div className="twitter-preview__profile-image">
				<img
					alt={ __( 'Twitter profile image', 'social-previews' ) }
					src={ profileImage || DEFAULT_PROPS.profileImage }
				/>
			</div>
			{ showThreadConnector && <div className="twitter-preview__connector" /> }
		</div>
	);
};
