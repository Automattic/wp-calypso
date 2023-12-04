interface LoginFooterProps {
	lostPasswordLink: JSX.Element;
}

const LoginFooter = ( { lostPasswordLink }: LoginFooterProps ) => {
	return <div className="wp-login__main-footer">{ lostPasswordLink }</div>;
};

export default LoginFooter;
