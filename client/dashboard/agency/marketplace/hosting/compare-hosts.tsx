import { Button, __experimentalVStack as VStack } from '@wordpress/components';
import { sprintf, __ } from '@wordpress/i18n';
import { chevronDown, chevronUp } from '@wordpress/icons';
import { useState } from 'react';
import { Card, CardBody } from '../../../components/card';
import pressableLogo from '../exclusive-offers/images/pressable-descriptor.svg';
import vipLogo from '../exclusive-offers/images/vip-descriptor.svg';
import wpcomLogo from '../exclusive-offers/images/wordpressdotcom-descriptor.svg';

const COMPARE_ROWS: { label: string; values: [ string, string, string ] }[] = [
	{
		label: __( 'Best for' ),
		values: [ __( 'Most client sites' ), __( 'Growing portfolios' ), __( 'Enterprise clients' ) ],
	},
	{
		label: __( 'Pricing' ),
		values: [
			__( 'From US$300 per site, per year' ),
			__( 'From US$250 per year' ),
			__( 'Custom pricing' ),
		],
	},
	{
		label: __( 'Pricing model' ),
		values: [
			__( 'Per site, with volume discounts up to 66%' ),
			__( 'One plan pooling traffic and storage across sites' ),
			__( 'Custom contract' ),
		],
	},
	{
		label: __( 'Development licenses' ),
		values: [ __( '5 free dev licenses included' ), '—', '—' ],
	},
	{
		label: __( 'Jetpack Complete' ),
		values: [ '—', __( 'Included with every site' ), '—' ],
	},
	{
		label: __( 'How you buy' ),
		values: [
			__( 'Add sites to cart, individually or in bulk' ),
			__( 'Pick a plan sized to your portfolio' ),
			sprintf(
				/* translators: %s: the referral commission percentage, e.g. 20% */
				__( 'Request a demo, or refer for a %s commission' ),
				'20%'
			),
		],
	},
];

export default function CompareHosts() {
	const [ isExpanded, setIsExpanded ] = useState( false );

	return (
		<VStack spacing={ 4 } alignment="flex-start">
			<Button
				variant="link"
				icon={ isExpanded ? chevronUp : chevronDown }
				iconPosition="right"
				onClick={ () => setIsExpanded( ! isExpanded ) }
			>
				{ isExpanded ? __( 'Hide comparison' ) : __( 'Compare hosts' ) }
			</Button>
			{ isExpanded && (
				<Card className="marketplace-hosting__compare-card">
					<CardBody>
						<table className="marketplace-hosting__compare">
							<thead>
								<tr>
									<th />
									<th>
										<img src={ wpcomLogo } alt="WordPress.com" />
									</th>
									<th>
										<img src={ pressableLogo } alt="Pressable" />
									</th>
									<th>
										<img src={ vipLogo } alt="WordPress VIP" />
									</th>
								</tr>
							</thead>
							<tbody>
								{ COMPARE_ROWS.map( ( row ) => (
									<tr key={ row.label }>
										<th scope="row">{ row.label }</th>
										{ row.values.map( ( value, i ) => (
											<td key={ i }>{ value }</td>
										) ) }
									</tr>
								) ) }
							</tbody>
						</table>
					</CardBody>
				</Card>
			) }
		</VStack>
	);
}
