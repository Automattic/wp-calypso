import { useTranslate } from 'i18n-calypso';
import './style.scss';

type TipProps = {
	title: string;
	content: string;
	link?: string;
	linkText?: string;
};

export const Tip = ( { title, content, link, linkText }: TipProps ) => {
	const translate = useTranslate();

	return (
		<div className="performance-profiler-tip">
			<h4>{ title }</h4>
			<p>{ content }</p>
			{ link && (
				<p className="learn-more-link">
					<a href={ link } target="_blank" rel="noreferrer">
						{ linkText ?? translate( 'Learn more ↗' ) }
					</a>
				</p>
			) }
		</div>
	);
};
