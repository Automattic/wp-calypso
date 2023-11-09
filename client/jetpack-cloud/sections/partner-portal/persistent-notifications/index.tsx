import Notice from 'calypso/components/notice';

import './style.scss';

type Props = {
	text?: string;
};

const JetpackPersistentNotifications = ( { text }: Props ) => {
	return (
		<Notice className="is-warning" showDismiss={ false } text={ text }>
			<a
				href="https://www.example.com"
				className="notice__dismiss"
				style={ {
					display: 'flex',
					flexShrink: 0,
					overflow: 'hidden',
					padding: '13px',
					margin: '0px 30px 0px 0px',
				} }
			>
				Testsss
			</a>
		</Notice>
	);
};

export default JetpackPersistentNotifications;
