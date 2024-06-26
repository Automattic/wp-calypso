import clsx from 'clsx';
import './style.scss';

type Props = {
	children?: React.ReactNode;
	className?: string;
};

export default function SitePreviewPaneFooter( { children, className }: Props ) {
	return (
		children && (
			<>
				<div className={ clsx( 'site-preview__footer', className ) }>{ children }</div>
			</>
		)
	);
}
