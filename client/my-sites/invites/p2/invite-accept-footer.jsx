import './style.scss';

const P2InviteAcceptFooter = ( props ) => {
	return (
		<div className="invite-accept-footer">
			<img
				src="/calypso/images/p2/w-logo.png"
				className="invite-accept-footer__w-logo"
				alt="WP.com logo"
			/>
			<span className="invite-accept-footer__footer-text">
				{ props.translate( 'Powered by WordPress.com' ) }
			</span>
		</div>
	);
};

export default P2InviteAcceptFooter;
