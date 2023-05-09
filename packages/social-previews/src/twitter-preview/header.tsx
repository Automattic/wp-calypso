import { formatTweetDate } from '../helpers';
import { HeaderProps } from './types';

export const Header: React.FC< HeaderProps > = ( { name, screenName, date } ) => {
	return (
		<div className="twitter-preview__header">
			<span className="twitter-preview__name">{ name }</span>
			<span className="twitter-preview__screen-name">{ screenName }</span>
			<span>·</span>
			<span className="twitter-preview__date">{ formatTweetDate( date ) }</span>
		</div>
	);
};
