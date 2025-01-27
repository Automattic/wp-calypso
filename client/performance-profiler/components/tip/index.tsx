import { useTranslate } from 'i18n-calypso';
import './style.scss';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { profilerVersion } from 'calypso/performance-profiler/utils/profiler-version';

export type TipProps = {
	title: string;
	content: string;
	link?: string;
	linkText?: string;
};

export const Tip = ( { title, content, link, linkText }: TipProps ) => {
	const translate = useTranslate();

	const handleLearnMoreClick = () => {
		recordTracksEvent( 'calypso_performance_profiler_tip_learn_more_clicked', {
			link: link,
			version: profilerVersion(),
		} );
	};

	return (
		<div className="performance-profiler-tip">
			<h4>{ title }</h4>
			<p>{ content }</p>
			{ link && (
				<p className="learn-more-link">
					<a href={ link } target="_blank" rel="noreferrer" onClick={ handleLearnMoreClick }>
						{ linkText ?? translate( 'Learn more ↗' ) }
					</a>
				</p>
			) }
		</div>
	);
};
