import { postWpLoginAction } from '../wp-login';
import type { LogoutUserArgs, LogoutUserResponse } from './types';

export async function logoutUser( data: LogoutUserArgs ): Promise< LogoutUserResponse > {
	const { data: response } = await postWpLoginAction< LogoutUserResponse >(
		'logout-endpoint',
		data
	);
	return response ?? {};
}
