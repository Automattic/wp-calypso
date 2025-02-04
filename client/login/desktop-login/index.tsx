import { FC } from 'react';

type Props = object;

// The login page of the WordPress.com Desktop app.
// Initially (action=start), a button is rendered that when clicked sends the user to their browser (outside the desktop app),
// so that they can log in to WordPress.com.
// When authentication is complete, the user is redirected back to the desktop app and ends up here (action=finalize),
// with their access token passed as a prop.
const DesktopLogin: FC< Props > = () => {
	return <></>;
};

export default DesktopLogin;
