import useLoginWindow from 'calypso/components/login-window';

const LoginWindowExample = () => {
	const { login } = useLoginWindow();
	const service = 'wordpress';
	return (
		<div className="design-assets__group">
			<div className="verbum-logins__social-buttons">
				<button type="button" key={ service } onClick={ login( service ) }>
					{ service }
				</button>
			</div>
		</div>
	);
};

export default LoginWindowExample;
