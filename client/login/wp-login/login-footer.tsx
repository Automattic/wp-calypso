interface LoginFooterProps {
	lostPasswordLink: JSX.Element;
}

const LoginFooter = ( { lostPasswordLink }: LoginFooterProps ) => {
	if ( ! lostPasswordLink ) {
		return null;
	}

	return <div className="wp-login__main-footer">{ lostPasswordLink }</div>;
};

export default LoginFooter;
