import TimeSince from 'calypso/components/time-since';
import { SitePlan } from 'calypso/sites-dashboard/components/sites-site-plan';
import { useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';

export default function ThemeSiteSelectorTableRow( { onChange, selected, site } ) {
	const userId = useSelector( getCurrentUserId );

	return (
		<tr>
			<td>
				<input
					id={ site.slug }
					className="components-radio-control__input"
					type="radio"
					name={ site.slug }
					value={ site.slug }
					onChange={ ( event ) => onChange( event.target.value ) }
					checked={ selected === site.slug }
				/>
			</td>
			<td>{ site.title }</td>
			<td>
				<SitePlan site={ site } userId={ userId } />
			</td>
			<td>{ site.options?.updated_at && <TimeSince date={ site.options.updated_at } /> }</td>
		</tr>
	);
}
