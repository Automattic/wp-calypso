import Gravatar from 'calypso/components/gravatar';
import SidebarFooter from 'calypso/layout/sidebar/footer';

export const GlobalSidebarFooter = ( { translate, user } ) => {
	return (
		<SidebarFooter>
			<span className="gap"></span>
			<a href="/read" className="link-reader">
				<span className="reader"></span>
			</a>
			<a href="/me" className="link-profile">
				<Gravatar
					className="masterbar__item-me-gravatar"
					user={ user }
					alt={ translate( 'My Profile' ) }
					size={ 28 }
				/>
			</a>
		</SidebarFooter>
	);
};

export default GlobalSidebarFooter;
