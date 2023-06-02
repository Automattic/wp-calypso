import { flagUrl } from 'calypso/lib/flags';

const StatsListCountryFlag = ( { countryCode } ) => (
	<span
		className="stats-list__flag-icon"
		style={ {
			backgroundImage: `url( ${ flagUrl( countryCode.toLowerCase() ) } )`,
		} }
	/>
);

export default StatsListCountryFlag;
