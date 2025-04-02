import { __experimentalHeading as Heading } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

function Domains() {
	return (
		<>
			<Heading>{ __( 'Domains' ) }</Heading>
			<p>{ __( 'This is the placeholder for the domains management area.' ) }</p>
		</>
	);
}

export default Domains;
