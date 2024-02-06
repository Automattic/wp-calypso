import TimeSince from 'calypso/components/time-since';
import { SitePlan } from 'calypso/sites-dashboard/components/sites-site-plan';
import { useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import isSiteP2Hub from 'calypso/state/selectors/is-site-p2-hub';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import isVipSite from 'calypso/state/selectors/is-vip-site';

export default function ThemeSiteSelectorTableRow( { onChange, selected, site } ) {
	const userId = useSelector( getCurrentUserId );
	const isVip = useSelector( ( state ) => isVipSite( state, site.ID ) );
	const isP2 = useSelector( ( state ) => isSiteWPForTeams( state, site.ID ) );
	const isP2Hub = useSelector( ( state ) => isSiteP2Hub( state, site.ID ) );

	if ( isVip || isP2 || isP2Hub ) {
		return null;
	}

	//console.log( site );

	return (
		<tr>
			<td>
				<input
					id={ site.slug }
					className="components-radio-control__input"
					type="radio"
					name={ site.slug }
					value={ site.ID }
					onChange={ ( event ) => onChange( parseInt( event.target.value ) ) }
					checked={ selected === site.ID }
				/>
			</td>
			<td>
				{ site.title }
				<br />
				{ site.slug }
			</td>
			<td>
				<SitePlan site={ site } userId={ userId } />
			</td>
			<td>{ site.options?.updated_at && <TimeSince date={ site.options.updated_at } /> }</td>
		</tr>
	);
}
