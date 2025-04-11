import { Button, Card } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import PageLayout from '../page-layout';

function Overview() {
	return (
		<PageLayout
			title={ __( 'Agency Overview' ) }
			actions={
				<>
					<Button variant="primary" __next40pxDefaultSize>
						{ __( 'Add Sites' ) }
					</Button>
					<Button variant="secondary" __next40pxDefaultSize>
						{ __( 'Add Products' ) }
					</Button>
				</>
			}
		>
			<Card>
				<div>
					<h2>{ __( 'Welcome to Agencies for Automattic' ) }</h2>
					<p>{ __( 'This is a sample overview page.' ) }</p>
				</div>
			</Card>
		</PageLayout>
	);
}

export default Overview;
