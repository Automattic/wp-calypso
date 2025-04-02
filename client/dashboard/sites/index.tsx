import { __experimentalHeading as Heading } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

function Sites() {
	return (
		<>
			<Heading>{ __( 'Sites' ) }</Heading>
			<p>{ __( 'This is the placeholder for the sites management area.' ) }</p>
		</>
	);
}

export default Sites;
