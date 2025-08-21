import './style.scss';
import { Icon, close } from '@wordpress/icons';
import { useOdieAssistantContext } from '../../context';
import { ConnectionStatus } from '../connection-status';

interface NoticeProps {
	content?: string | React.ReactNode;
	onClose?: () => void;
}

export const Notice: React.FC< NoticeProps > = ( { content, onClose } ) => {
	return (
		<div className="odie-notice">
			{ content && <span>{ content }</span> }
			<button className="odie-notice__close-button" onClick={ onClose }>
				<Icon icon={ close } size={ 12 } />
			</button>
		</div>
	);
};

export const Notices = () => {
	const { notices, setNotice, chat } = useOdieAssistantContext();

	return (
		<div className="odie-notices">
			{ chat.provider?.startsWith( 'zendesk' ) && <ConnectionStatus /> }
			{ Object.entries( notices ).map( ( [ noticeId, noticeContent ] ) => (
				<Notice
					key={ noticeId }
					content={ noticeContent }
					onClose={ () => setNotice( noticeId, null ) }
				/>
			) ) }
		</div>
	);
};
