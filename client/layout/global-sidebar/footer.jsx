import AsyncLoad from 'calypso/components/async-load';
import SidebarFooter from 'calypso/layout/sidebar/footer';
import ProfileGravatar from 'calypso/me/profile-gravatar';

export const GlobalSidebarFooter = ( { translate, user } ) => {
	return (
		<SidebarFooter>
			<ProfileGravatar inSidebar user={ user } profileImgSize={ 24 } />
			<span className="gap"></span>
			<AsyncLoad
				require="./menu-items/help-center/help-center"
				tooltip={ translate( 'Help' ) }
				placeholder={
					<div className="link-help">
						<span className="help"></span>
					</div>
				}
			/>
		</SidebarFooter>
	);
};

export default GlobalSidebarFooter;
