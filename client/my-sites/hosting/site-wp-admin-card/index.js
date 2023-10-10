/* eslint-disable wpcalypso/jsx-gridicon-size */
import { Card, Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { CardBody, ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import CardHeading from 'calypso/components/card-heading';

const ToggleContainer = styled.div( {
	fontSize: '14px',
	label: {
		fontSize: '14px',
	},
} );

const ToggleLabel = styled.p( {
	marginBottom: '9px',
	fontWeight: 600,
	fontSize: '14px',
} );

export default function SiteWpAdminCard() {
	const translate = useTranslate();
	const defaultWpAdminToggleDescription = translate(
		'Default the site interface and navigation to wp-admin'
	);
	return (
		<Card className="sitewpadmin-card">
			<Gridicon icon="my-sites" size={ 32 } />
			<CardHeading id="sitewpadmin-card" size={ 20 }>
				{ translate( 'Switch to wp-admin' ) }
			</CardHeading>
			<CardBody>
				<p>{ translate( 'Switch your site interface and navigation to wp-admin.' ) }</p>
				<ToggleContainer>
					<ToggleLabel>{ translate( 'Default to wp-admin' ) }</ToggleLabel>
					<ToggleControl label={ defaultWpAdminToggleDescription } />
				</ToggleContainer>
			</CardBody>
		</Card>
	);
}
