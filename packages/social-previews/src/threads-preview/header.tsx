import { __ } from '@wordpress/i18n';
import { formatThreadsDate } from '../helpers';
import { HeaderProps } from './types';

export const Header: React.FC< HeaderProps > = ( { name, date } ) => {
	const postDate = date || new Date();

	return (
		<div className="threads-preview__header">
			<span className="threads-preview__name">
				{ name || __( 'Account Name', 'social-previews' ) }
			</span>
			<time className="threads-preview__date" dateTime={ postDate.toISOString() }>
				{ formatThreadsDate( postDate ) }
			</time>
		</div>
	);
};
