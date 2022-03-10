import Spotlight from 'calypso/components/spotlight';

export default function SpotlightTemplate( props ) {
	const { trackImpression } = props;

	return (
		<>
			{ trackImpression && trackImpression() }
			<Spotlight />
		</>
	);
}
