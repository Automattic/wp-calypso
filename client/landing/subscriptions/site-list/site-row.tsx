import { SiteType } from './site-types';

export default function SiteRow( { id, name, icon, url, date, emailFrequency }: SiteType ) {
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
		</li>
	);
}
