import './style.scss';

const P2InviteAcceptHeader = ( props ) => {
	return (
		<div className="invite-accept-header">
			<div className="invite-accept-header__site-icon">
				<span>P2</span>
			</div>
			<div className="invite-accept-header__join-site-title">
				{ props.translate( 'Join %(siteName)s on P2', {
					args: {
						siteName: props.site.title,
					},
				} ) }
			</div>
			<div className="invite-accept-header__join-site-text">
				{ props.translate(
					'P2 is a platform for teams to share, discuss, and collaborate openly, without interruption. {{linkWrap}}Learn more.{{/linkWrap}}',
					{
						components: {
							linkWrap: <a href="https://wordpress.com/p2" target="_blank" rel="noreferrer" />,
						},
					}
				) }
			</div>
		</div>
	);
};

export default P2InviteAcceptHeader;
