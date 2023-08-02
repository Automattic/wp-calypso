import PropTypes from 'prop-types';
import Gravatar from 'calypso/components/gravatar';

import './style.scss';

const User = ( { user }: { user: { display_name?: string; name?: string } } ) => {
	const name = user ? user.display_name || user.name || '' : '';
	return (
		<div className="user" title={ name }>
			<Gravatar size={ 26 } user={ user } />
			<span className="user__name">{ name }</span>
		</div>
	);
};

User.propTypes = {
	user: PropTypes.object,
};

export default User;
