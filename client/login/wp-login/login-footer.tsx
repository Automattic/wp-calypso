import SocialTos from 'calypso/blocks/authentication/social/social-tos';

interface LoginFooterProps {
	lostPasswordLink: JSX.Element;
	shouldRenderTos: boolean;
}

const LoginFooter = ( { lostPasswordLink, shouldRenderTos }: LoginFooterProps ) => {
	if ( ! lostPasswordLink && ! shouldRenderTos ) {
		return null;
	}

	return (
		<div className="wp-login__main-footer">
			{ shouldRenderTos && <SocialTos /> }
			{ lostPasswordLink }
		</div>
	);
};

export default LoginFooter;
