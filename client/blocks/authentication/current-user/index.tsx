import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';

import './style.scss';

type CurrentUserProps = {
	avatarUrl: string;
	name: string;
	email: string;
};

const CurrentUser = ( { avatarUrl, name, email }: CurrentUserProps ) => (
	<HStack className="auth-current-user" spacing={ 4 } justify="flex-start" alignment="center">
		<img className="auth-current-user__avatar" src={ avatarUrl } alt="" />
		<VStack spacing={ 0 }>
			<span className="auth-current-user__name">{ name }</span>
			<span className="auth-current-user__email">{ email }</span>
		</VStack>
	</HStack>
);

export default CurrentUser;
