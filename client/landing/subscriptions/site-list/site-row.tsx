import { NotificationSettings } from '../notification-settings';
import { SiteType } from '../types';

type SiteRowProps = {
	site: SiteType;
};

export default function SiteRow( { site }: SiteRowProps ) {
	const { id, icon, name, url, date, emailFrequency } = site;

	return (
		<li className="row" role="row" key={ id }>
			<span className="title-box" role="cell">
				<img className="icon" src={ icon } alt={ name } />
				<span className="title-column">
					<span className="name">{ name }</span>
					<span className="url">{ url }</span>
				</span>
			</span>
			<span className="date" role="cell">
				{ date.toDateString() }
			</span>
			<span className="email-frequency" role="cell">
				{ emailFrequency }
			</span>
			<span className="actions" role="cell">
				<NotificationSettings
					emailFrequency="instantly"
					sendCommentsByEmail={ true }
					sendPostsByEmail={ true }
					sendPostsByNotification={ true }
					onChangeEmailFrequency={ () => null }
					onChangeSendCommentsByEmail={ () => null }
					onChangeSendPostsByEmail={ () => null }
					onChangeSendPostsByNotification={ () => null }
				/>
			</span>
		</li>
	);
}
