import './style.scss';

type Props = {
	children?: React.ReactNode;
};

export default function SitePreviewPaneFooter( { children }: Props ) {
	return (
		<>
			<div className="site-preview__footer">{ children }</div>
		</>
	);
}
