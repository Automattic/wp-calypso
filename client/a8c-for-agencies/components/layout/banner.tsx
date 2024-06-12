import NoticeBanner from '@automattic/components/src/notice-banner';
import clsx from 'clsx';
import { ReactNode } from 'react';

type Props = {
	actions?: React.ReactNode[];
	className?: string;
	children: ReactNode;
	level: 'error' | 'warning' | 'info' | 'success';
	onClose?: () => void;
	title?: string;
};

export default function LayoutBanner( { className, children, onClose, title, actions }: Props ) {
	const wrapperClass = clsx( className, 'a4a-layout__banner' );

	return (
		<div className={ wrapperClass }>
			<NoticeBanner level="success" onClose={ onClose } title={ title } actions={ actions }>
				{ children }
			</NoticeBanner>
		</div>
	);
}
