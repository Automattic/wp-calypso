import './style.scss';
import { Icon, close } from '@wordpress/icons';
import { useOdieAssistantContext } from '../../context';

interface OdieNoticeProps {
	content?: string | React.ReactNode;
	onClose?: () => void;
}

export const OdieNotice: React.FC< OdieNoticeProps > = ( { content, onClose } ) => {
	return (
		<div className="odie-notice">
			{ content && <span>{ content }</span> }
			<button className="odie-notice__close-button" onClick={ onClose }>
				<Icon icon={ close } size={ 12 } />
			</button>
		</div>
	);
};

export const OdieNotices = () => {
	const { notices, setNotice } = useOdieAssistantContext();

	if ( Object.keys( notices ).length === 0 ) {
		return null;
	}

	return (
		<div className="odie-notices">
			{ Object.entries( notices ).map( ( [ noticeId, noticeContent ] ) => (
				<OdieNotice
					key={ noticeId }
					content={ noticeContent }
					onClose={ () => setNotice( noticeId, null ) }
				/>
			) ) }
		</div>
	);
};
