import Gravatar from 'calypso/components/gravatar';

export const MySitesSidebarUnifiedFooter = ( { translate, user } ) => {
	return (
		<div className="sidebar__footer">
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
		</div>
	);
};

export default MySitesSidebarUnifiedFooter;
