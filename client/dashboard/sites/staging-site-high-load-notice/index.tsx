import Notice from '../../components/notice';
import './style.scss';

export default function StagingSiteHighLoadNotice( { children }: { children: React.ReactNode } ) {
	return (
		<div className="staging-site-high-load-notice">
			<Notice variant="warning">{ children }</Notice>
		</div>
	);
}
