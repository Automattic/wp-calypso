import { __ } from '@wordpress/i18n';
import { formatTweetDate } from '../helpers';
import { HeaderProps } from './types';

export const Header: React.FC< HeaderProps > = ( { name, screenName, date } ) => {
	return (
		<div className="twitter-preview__header">
			<span className="twitter-preview__name">
				{ name || __( 'Account Name', 'social-previews' ) }
			</span>
			<span className="twitter-preview__screen-name">{ screenName || '@account' }</span>
			<span>·</span>
			<span className="twitter-preview__date">{ formatTweetDate( date || Date.now() ) }</span>
		</div>
	);
};
