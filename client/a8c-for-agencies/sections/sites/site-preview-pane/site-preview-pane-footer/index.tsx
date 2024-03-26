import classNames from 'classnames';
import './style.scss';

type Props = {
	children?: React.ReactNode;
	className?: string;
};

export default function SitePreviewPaneFooter( { children, className }: Props ) {
	return (
		children && (
			<>
				<div className={ classNames( 'site-preview__footer', className ) }>{ children }</div>
			</>
		)
	);
}
