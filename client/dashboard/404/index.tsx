import { useNavigate, useRouter } from '@tanstack/react-router';
import {
	Card,
	Flex,
	FlexBlock,
	__experimentalHeading as Heading,
	Button,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

function NotFound() {
	const to = '/sites';
	const navigate = useNavigate();
	const router = useRouter();
	const href = router.buildLocation( {
		to,
	} ).href;

	return (
		<Flex
			direction="column"
			justify="center"
			align="center"
			style={ {
				height: '100vh',
				textAlign: 'center',
				padding: '0 20px',
			} }
		>
			<Card size="large" style={ { maxWidth: '500px', overflow: 'hidden' } }>
				<div style={ { padding: '32px' } }>
					<Flex direction="column" gap={ 4 } justify="center" align="center">
						<Heading level={ 1 }>{ __( '404' ) }</Heading>
						<Heading level={ 3 }>{ __( 'Page not found' ) }</Heading>
						<FlexBlock>
							<p>
								{ __( 'Sorry, the page you are looking for does not exist or has been moved.' ) }
							</p>
						</FlexBlock>
						<div style={ { marginTop: '8px', marginBottom: '8px' } }>
							<Button variant="primary" href={ href } onClick={ () => navigate( { to } ) }>
								{ __( 'Go to Sites' ) }
							</Button>
						</div>
					</Flex>
				</div>
			</Card>
		</Flex>
	);
}

export default NotFound;
